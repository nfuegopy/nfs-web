# AGY VPS DIAGNOSIS

## 1. Objetivo
El objetivo de este diagnóstico es explicar e investigar un incidente reportado donde el frontend anuncia una creación exitosa de cuenta, pero algunas de estas cuentas no se persistían en el servidor real de NFS. Dado que pruebas directas anteriores sí habían creado cuentas reales, el objetivo principal fue aislar el fallo verificando paso a paso la infraestructura productiva (API, provider, bridge, NGINX y persistencia) frente a lo que experimenta el frontend.

## 2. Estado del servicio
El servicio que corre la API está configurado a través de systemd y opera bajo los siguientes parámetros reales encontrados en el servidor:
- **Servicio systemd:** `nfs-api.service`
- **Estado:** Active (running)
- **PID principal:** 1212235 (node)
- **WorkingDirectory:** `/opt/nfs-web/apps/api`
- **ExecStart:** `/usr/bin/node /opt/nfs-web/apps/api/dist/main.js`
- **EnvironmentFile:** `/opt/nfs-web/apps/api/.env`
- **Ruta del proyecto:** `/opt/nfs-web`
- **Puerto interno:** 3100

## 3. Estado Git del VPS
El repositorio en producción presenta el siguiente estado:
- **Branch desplegado:** `master`
- **Commit HEAD:** `39268ad`
- **Relación con origin/master:** Up to date.
- **Últimos commits relevantes:** 
  - `39268ad` Merge pull request #3
  - `ed34ac2` Correcciones
  - `1225cd4` Ajuste sobre puerto a escuchar
- **Archivos modificados no trackeados (dist):** Se encontraron modificaciones locales sin commitear en los archivos compilados de NestJS en `apps/api/dist/main.js` y `apps/api/dist/main.js.map`. Las modificaciones corresponden a la asignación estricta de bind IP (`127.0.0.1`) en la llamada `app.listen()`.
- **Artefactos adicionales:** Existe un archivo untracked llamado `apps/web/nfs-static.zip`.

## 4. Configuración efectiva del API
El entorno de proceso de NestJS se verificó desde `/proc/<pid>/environ`. Se comprobó que producción usa `NFS_PROVIDER=python` de forma correcta.
Los valores efectivos son:
- **NFS_PROVIDER:** `python` (sin saltos de línea ni espacios)
- **NFS_BRIDGE_PATH:** `/opt/nfs-web-bridge/nfs-account-bridge.py`
- **NFS_PYTHON_BIN:** `python3`
- **NFS_SERVER_PATH:** `/opt/NFS-Online-Server`
- **PORT:** `3100`
- **FRONTEND_URL:** `https://nfs.acbldeveloper.com`

## 5. Python Provider
El flujo efectivo de NestJS **sí utiliza el `PythonNfsAccountProvider`**. La evidencia que lo confirma es doble:
1. La variable de entorno `NFS_PROVIDER=python` fue validada en el archivo `.env` mediante `cat -A` comprobando que no tiene caracteres de escape incorrectos (`python$`), por lo que la condición estricta en el `NfsModule` se cumple exitosamente.
2. La base de datos persistió correctamente una petición pública que pasó por este pipeline.

## 6. Bridge real
El bridge utilizado es el archivo real externo: `/opt/nfs-web-bridge/nfs-account-bridge.py`.
- **Configuración efectiva:** Es el bridge que está siendo ejecutado por el proveedor de Python de la API.
- **Acciones soportadas:** Soporta únicamente la acción `createAccount`. Rechaza cualquier otra acción emitiendo un código de salida 1.
- **Entrada y Salida:** Recibe los datos mediante JSON a través de `sys.stdin.read()` y responde un JSON en stdout antes de hacer `sys.exit`.
- **Uso del servidor real:** El bridge carga el código y las dependencias reales desde `/opt/NFS-Online-Server/server` e importa `SQLiteCredentialStore`.
- **Persistencia:** Persiste en la base de datos oficial leyendo el archivo de configuración en `/opt/NFS-Online-Server/config/server.toml`.
- **Diferencia vital:** Este bridge de producción es totalmente distinto al stub (simulador) incluido en el directorio `scripts/` del repositorio, el cual solo simulaba éxito en memoria.

## 7. NGINX
La configuración de NGINX respecto a la API (`nfs-api.acbldeveloper.com`) redirige efectivamente el tráfico público al backend de NestJS:
- **server_name:** `nfs-api.acbldeveloper.com`
- **HTTPS:** Configurado y activo a través de Certbot (`listen 443 ssl;`).
- **proxy_pass:** `http://127.0.0.1:3100`
- **upstream real:** La petición se rutea directamente al puerto local interno `3100` donde corre el proceso Node de NestJS.

## 8. API pública
Se realizó una prueba externa completa controlada contra `https://nfs-api.acbldeveloper.com/api/accounts`.
- **Username utilizado:** `testpub3`
- **Status HTTP:** `201 Created`
- **Respuesta relevante:** `{"success":true,"message":"Cuenta creada correctamente","account":{"username":"testpub3","persona":"TestPub3"}}`
- **Resultado de persistencia:** La cuenta `testpub3` fue creada de forma totalmente funcional, demostrando que la infraestructura externa expuesta de la API opera según lo esperado.

## 9. Persistencia real
Se comprobó la persistencia mediante la herramienta oficial del administrador del servidor NFS (`python3 nfs_online.py account list`). 
Al ejecutar la búsqueda para el nombre `testpub3`, el comando devolvió:
`account=testpub3 persona=TestPub3 enabled=1 banned=0 email=-`
Lo que confirma definitivamente que la cuenta terminó persistida y habilitada en el archivo real `/opt/NFS-Online-Server/data/accounts.sqlite3`. No se generaron bases de datos fantasmas en directorios relativos.

## 10. Flujo confirmado
El siguiente flujo se encuentra **CONFIRMADO** por pruebas reales de extremo a extremo:
[CONFIRMADO] Internet (Cliente cURL externo)
→ [CONFIRMADO] HTTPS (`nfs-api.acbldeveloper.com`)
→ [CONFIRMADO] NGINX (Proxy Pass)
→ [CONFIRMADO] NestJS (`127.0.0.1:3100`)
→ [CONFIRMADO] `PythonNfsAccountProvider`
→ [CONFIRMADO] Bridge real (`nfs-account-bridge.py`)
→ [CONFIRMADO] Configuración NFS (`server.toml`)
→ [CONFIRMADO] Base de datos persistente (`accounts.sqlite3`)

## 11. Hipótesis descartadas
Basado en la evidencia recolectada en el VPS, quedan descartadas explícitamente las siguientes hipótesis:
- **Producción usando MockNfsAccountProvider:** Falso. NestJS usa el provider real.
- **NGINX apuntando a un upstream incorrecto:** Falso. Apunta exactamente al puerto 3100 correspondiente al proceso del API.
- **Bridge real roto o guardando en base errónea:** Falso. El bridge de Python funciona y lee la ruta correcta desde `server.toml`.
- **API pública incapaz de persistir:** Falso. El request externo de la prueba guardó exitosamente la cuenta en la DB real.
- **SQLite/NFS incapaz de recibir nuevas cuentas:** Falso. El servidor procesa exitosamente los registros nuevos.

## 12. Hipótesis que siguen abiertas
El incidente debe provenir del lado del cliente/Navegador. Siguen abiertas:
- Frontend desplegado utilizando una URL incorrecta (`apiUrl`) en el entorno de ejecución.
- El bundle Nuxt empaquetado (ej. `nfs-static.zip`) apunta a `localhost:3100` y está interactuando con el backend local del desarrollador en lugar del VPS.
- Un Service Worker, caché agresiva del navegador, o CDN está interceptando el POST y devolviendo un JSON de éxito falso de intentos pasados.
- La lógica interna del frontend está ignorando o interpretando incorrectamente algún código de estado o error.

## 13. Hallazgo principal hasta ahora
La infraestructura de producción, desde el ingreso público a la API hasta la persistencia final en la base de datos, funciona de manera correcta y estable. La investigación restante queda acotada principalmente al código del frontend desplegado y a las particularidades de la petición HTTP que genera el navegador web del usuario.

## 14. Próxima prueba
**[PENDIENTE] Inspección de Red del Navegador**
Deberá abrirse la página del frontend (`https://nfs.acbldeveloper.com/registro`) y capturar, a través de la pestaña DevTools → Network del navegador, la petición `accounts` tras enviar el formulario.
Necesitamos obtener la siguiente evidencia estricta:
- Request URL
- Method
- Status Code
- Origin
- Request Payload (ocultando la contraseña real)
- Response Body
Después de esta captura, deberá verificarse en el VPS si ese `username` exacto logró o no llegar a SQLite.

## 15. Restricciones vigentes
- No modificar `/opt/NFS-Online-Server`.
- No alterar cuentas existentes.
- No exponer secretos.
- No hacer cambios destructivos.
- No modificar producción hasta tener causa raíz del frontend validada.
- No corregir todavía el frontend.

## 16. Conclusión provisional
La ruta API pública → NGINX → NestJS → provider Python → bridge real → NFS/SQLite fue validada exitosamente. El incidente original todavía requiere observar una petición real generada por el frontend desplegado antes de confirmar la causa raíz.
