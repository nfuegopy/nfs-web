# NFSU2 Online · Portal web

Portal del servidor comunitario de **Need for Speed Underground 2**. Desde la web se crea la cuenta que se usa dentro del juego,
se inicia sesión con esos mismos datos y se consultan estadísticas, ranking y la guía de instalación.

- Web: <https://nfs.acbldeveloper.com>
- API: <https://nfs-api.acbldeveloper.com/api>

Estado al **15/10/2026**: en producción y funcionando (registro, login, panel, ranking, cambio y recuperación de contraseña).

---

## Cómo está armado

```text
Navegador ──► nfs.acbldeveloper.com        (Hostinger, hosting compartido: web estática Nuxt)
    │
    └─ fetch + cookie ──► nfs-api.acbldeveloper.com   (VPS 187.77.254.207)
                              nginx :443 ─► NestJS 127.0.0.1:3100  (servicio systemd nfs-api)
                                                 │ spawn + stdin/stdout JSON
                                                 ▼
                              scripts/nfs-web-bridge.py
                                                 │ usa el código del propio servidor
                                                 ▼
                              /opt/NFS-Online-Server  ─►  data/accounts.sqlite3
```

| Pieza | Dónde vive | Qué hace |
|---|---|---|
| `apps/web` | Hostinger, `public_html/nfs` | Nuxt 4 generado como sitio estático. Páginas: inicio, registro, ingresar, panel, ranking, cómo jugar, olvidé / restablecer contraseña |
| `apps/api` | VPS, `/opt/nfs-web/apps/api` | NestJS. Valida todo, maneja la sesión y llama al bridge. No guarda contraseñas ni tiene base propia |
| `scripts/nfs-web-bridge.py` | VPS, `/opt/nfs-web/scripts` | Único punto de contacto con el servidor del juego. Crea cuentas y verifica contraseñas con la lógica de NFS-Online-Server; lee estadísticas en modo sólo lectura |
| NFS-Online-Server | VPS, `/opt/NFS-Online-Server` | El servidor del juego. **No se modifica nunca** desde este proyecto |

La cuenta es **una sola**: la que se crea en la web es la misma con la que se entra al online del juego, y cambiar la contraseña en la web la cambia también en el juego.

## Funciones

- **Registro** con usuario, nombre de piloto, email y contraseña. La cuenta se crea en el servidor del juego y la sesión web queda iniciada.
- **Login web** con el usuario y contraseña del juego. El servidor bloquea la cuenta unos minutos después de varios intentos fallidos.
- **Panel del jugador**: carreras, victorias, efectividad, skill, estadísticas por modo (Circuito, Sprint, Drag, Drift, Street X, URL), últimas carreras con tiempos, estado de conexión.
- **Ranking** público por modo y números reales en la portada (pilotos, conectados, carreras).
- **Cambio de contraseña** desde el panel (pide la actual).
- **Recuperación por email** desde `contacto@acbldeveloper.com`: enlace firmado que vence a los 30 minutos y sirve una sola vez.
- **Guía "Cómo jugar"**: descarga, instalación, copia de seguridad, complementos online, widescreen fix, partida con todo desbloqueado (`Nfuego.rar`) y solución de problemas.

## API

Prefijo `/api`. Errores con forma `{ "code": "...", "message": "..." }`.

| Método | Ruta | Sesión | Descripción |
|---|---|---|---|
| GET | `/health` | — | Estado |
| GET | `/summary` | — | Pilotos, conectados y carreras |
| GET | `/leaderboard?category=0..5` | — | Ranking de Underground 2 por modo |
| POST | `/accounts` | — | Crear cuenta (inicia sesión) |
| POST | `/auth/login` · `/auth/logout` | — | Iniciar / cerrar sesión |
| GET | `/auth/me` | ✔ | Usuario de la sesión |
| GET | `/me/profile` | ✔ | Perfil, estadísticas y carreras |
| POST | `/auth/password` | ✔ | Cambiar contraseña |
| POST | `/auth/password/forgot` · `/auth/password/reset` | — | Recuperar contraseña por email |

## Seguridad

- Sesión en cookie `httpOnly`, `Secure`, `SameSite=Lax`, firmada con HMAC (`SESSION_SECRET`), 7 días.
- Validación doble (API y bridge): patrones por campo, tipos, largos, sin caracteres de control, se rechazan campos desconocidos.
- Todas las consultas SQL del bridge son parametrizadas; los datos del usuario nunca se pasan como argumentos de comandos.
- Límite de intentos: login 10/min, registro 5/min, recuperación 3/min por IP.
- La respuesta de "olvidé mi contraseña" es siempre la misma, para no revelar qué emails existen.
- CORS sólo para `https://nfs.acbldeveloper.com`, con credenciales.

## Desarrollo local

```bash
npm install

# API con datos simulados en memoria (no toca el servidor real)
cd apps/api && cp .env.example .env    # NFS_PROVIDER=mock
npm run start:dev                      # http://localhost:3100/api

# Web
cd apps/web && npm run dev             # http://localhost:3000
```

`NFS_PROVIDER` es obligatorio: `python` en el VPS, `mock` en local. Con cualquier otro valor la API no arranca, para que nunca se use el mock en producción por error.

## Despliegue

### API (VPS)

En la consola del VPS (hPanel → VPS → Consola web):

```bash
cd /opt/nfs-web && git pull --ff-only origin master && bash deploy/deploy-api.sh master
```

El script respalda `.env`, configura bridge, cookies y SMTP, genera `SESSION_SECRET` si falta, compila, reinicia `nfs-api` y espera a que responda. La consola web se suele desconectar: si pasa, correrlo con `nohup ... > /tmp/deploy-api.log 2>&1 &` y revisar el log.

La contraseña del correo **no** está en el repo. Se carga una sola vez en el VPS:

```bash
read -rsp 'SMTP_PASS: ' P && echo && echo "SMTP_PASS=$P" >> /opt/nfs-web/apps/api/.env && unset P && systemctl restart nfs-api
```

### Web (Hostinger)

```bash
cd apps/web
NUXT_PUBLIC_API_URL=https://nfs-api.acbldeveloper.com/api npx nuxt generate
```

Subir **todo** el contenido de `apps/web/.output/public` (incluida la carpeta `_nuxt/`) a `public_html/nfs`, después de renombrar la carpeta actual como respaldo (`nfs-backup-AAAAMMDD`). Si se sube como ZIP, crearlo con rutas `/` (por ejemplo con Python): `Compress-Archive` de PowerShell 5.1 usa `\` y en el servidor los archivos quedan con nombres rotos.

**Orden:** primero la API, después la web.

## Historial

| Fecha | Cambio |
|---|---|
| 03/10 | Integración real con el servidor del juego mediante el bridge Python |
| 14/10 | **Bug "la web dice que creó la cuenta pero no se guarda":** la causa real era que en Hostinger faltaba la carpeta `_nuxt/` (todo el JavaScript daba 404), así que el formulario nunca llegaba a la API. El backend funcionaba bien |
| 14/10 | Login web, panel, ranking, registro con email, rediseño, ojo de contraseña propio, se quitan dependencias sin uso y `dist/` del repo |
| 15/10 | Validación estricta contra inyección, cambio y recuperación de contraseña por email, guía con widescreen fix, copia de seguridad y partida desbloqueada |

Los documentos de `.ai-work/` son del diagnóstico anterior y quedaron desactualizados; este README es la referencia.

## Pendiente

- **Completar el paso "Entrá al servidor" de la guía** con el recorrido exacto del menú del juego (falta leer la documentación de NFS-Online-Server en el VPS).
- **Verificar el email al registrarse** (hoy se guarda pero no se confirma con un código).
- **Más de un piloto por cuenta** desde el panel (el servidor ya lo soporta).
- **Panel de administración**: suspender cuentas, ver conectados.
- **Llave SSH** para administrar el VPS sin depender de la consola web.
- Cambiar la contraseña de `contacto@acbldeveloper.com` (quedó escrita en un chat) y volver a cargarla con el comando de arriba.
- Opcional: servir la web desde el VPS para desplegar todo con un solo script.
