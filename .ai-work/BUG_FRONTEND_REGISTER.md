# Registro del frontend: auditoría sin correcciones

Fecha: 2026-10-03. Revisión local: `ed34ac2`. Estado: diagnóstico local reproducido; causa del incidente de producción pendiente de acceso.

## Síntoma y alcance

El usuario informa que el frontend desplegado anuncia la creación de una cuenta que no aparece en NFS. Pruebas anteriores de NestJS → PythonNfsAccountProvider → bridge de producción → NFS → SQLite sí crearon cuentas reales. Esa evidencia se conserva: no se atribuye el fallo al servidor NFS ni al bridge real sin inspeccionarlos.

No se modificó código, configuración, servicios ni `/opt/NFS-Online-Server`. Sólo se añadieron documentos de auditoría. Las pruebas locales usan memoria y resultados simulados, sin cuentas reales.

## Flujo esperado

Formulario → POST JSON al API de producción → validación DTO → provider Python efectivo → bridge `/opt/nfs-web-bridge/nfs-account-bridge.py` → persistencia en `/opt/NFS-Online-Server/data/accounts.sqlite3` → resultado confirmado → respuesta HTTP → mensaje del frontend.

## Flujo real confirmado en el código local

1. `apps/web/app/pages/registro.vue` ejecuta `handleRegister` al enviar el formulario. Compara contraseña y confirmación antes del request. Los campos HTML exigen username/persona de 3–20 caracteres y contraseña de 8–64; username acepta letras ASCII, dígitos, guiones y guiones bajos.
2. Lee `useRuntimeConfig().public.apiUrl`, con fallback `http://localhost:3100/api`. `nuxt.config.ts` configura ese mismo fallback desde `NUXT_PUBLIC_API_URL`.
3. Envía `fetch(apiUrl + '/accounts')`, método POST, `Content-Type: application/json`, cuerpo `{username, persona, password}`. No envía confirmación ni token Turnstile, no normaliza espacios ni slash final y no solicita credentials. Fetch conserva sus defaults de redirección y credenciales.
4. Ejecuta `response.json()`. Si `response.ok` es falso muestra error; en caso contrario anuncia éxito y oculta el formulario. No inspecciona `data.success` ni `data.account`. Un 2xx con JSON `{success:false}` también muestra éxito. Una falla CORS/red, JSON inválido o respuesta no 2xx conduce a error, no a este mensaje de éxito.
5. Nest aplica prefijo `api`, por lo que `@Controller('accounts')` y `@Post()` reciben **POST `/api/accounts`**. CORS permite `FRONTEND_URL` o `http://localhost:3000`.
6. `ValidationPipe({whitelist:true, transform:true})` valida strings, longitudes y regex del username; elimina propiedades sin decoradores. No modifica los strings para normalizarlos.
7. `AccountsController` inyecta directamente `NfsAccountProvider`; `AccountsService` está vacío y no participa. Ejecuta `accountExists`, `personaExists`, `createAccount` y devuelve `{success:true,message,account:{username,persona}}` si las promesas resuelven. POST retorna normalmente 201. El catch convierte cualquier excepción del provider a HTTP 400, incluso errores internos o conflictos. Hay una comparación tautológica `password !== password` que no valida nada, pero la confirmación ya se comprueba en la UI.
8. `NfsModule`: sólo el valor exacto `NFS_PROVIDER=python` selecciona Python. Valor ausente, `mock`, typo, mayúsculas o espacios selecciona silenciosamente `MockNfsAccountProvider`.
9. El mock guarda username/persona exclusivamente en Sets del proceso y resuelve la creación. El controller y el frontend anuncian éxito aunque NFS/SQLite nunca sean consultados.
10. Python usa `spawn(NFS_PYTHON_BIN || 'python3', [NFS_BRIDGE_PATH])`, stdin JSON `{action,...data}`, hereda entorno y cwd del proceso; no pasa `cwd` ni `NFS_SERVER_PATH` explícitamente. El hijo hereda cualquier `NFS_SERVER_PATH` exportado, pero el provider no lo consume.
11. Acumula stdout y stderr, registra stderr como warning, parsea TODO stdout como JSON en `close`. **No valida exit code**, no hay timeout y `createAccount` sólo rechaza `result.success === false`. Objetos como `{}` o `{exists:false}` se aceptan como creación. Texto extra en stdout causa error de parseo; salida vacía también falla. No comprueba persistencia.
12. Preconsultas envían acciones `checkAccount` y `checkPersona`; sus excepciones se silencian y retornan false. El bridge incluido en `scripts/` entiende `accountExists` y `personaExists`, y **simula** `createAccount` sin persistencia. Esto NO demuestra qué hace el bridge externo del VPS.

## Configuración local y diferencias por verificar

| Elemento | Evidencia local | Producción |
|---|---|---|
| `apps/web/.env` | `NUXT_PUBLIC_API_URL=http://localhost:3100/api` | Pendiente: runtime servido al navegador y bundle desplegado |
| Artefacto `.nuxt/dev/index.mjs` | `public.apiUrl=http://localhost:3100/api` | No hay `.output` local para comparar |
| `apps/api/.env` | `NFS_PROVIDER=python`; bridge externo `/opt/nfs-web-bridge/nfs-account-bridge.py`; Python `python3`; PORT 3100; FRONTEND_URL localhost:3000 | Pendiente: entorno efectivo del proceso y archivos cargados |
| `.env.example` | `NFS_PROVIDER=mock` | Riesgo si se copió sin cambiar provider |
| `ConfigModule.forRoot({isGlobal:true})` | Busca `.env` relativo a `process.cwd()`; sin envFilePath explícito ni validación de provider | Verificar WorkingDirectory, EnvironmentFile, entorno heredado y comando ExecStart |
| Precedencia de configuración | Código instalado de @nestjs/config: entorno existente prevalece sobre `.env` por defecto | `.env` editado no basta si systemd ya impone otro valor; selección ocurre al crear módulo |
| Bridge incluido | Stub sin acceso NFS | No confundir con bridge externo probado previamente |
| Build API | `dist/main.js` local no tiene bind explícito 127.0.0.1; `src/main.ts` sí | Hay evidencia local de artefacto desactualizado; no demuestra desfase remoto |

En un frontend con fallback localhost, el POST del navegador apunta al equipo del visitante. Puede fallar por mixed content/red; por sí solo eso no explica un mensaje de éxito. Hace falta comprobar la URL efectiva y la respuesta recibida. Para SSR, revisar entorno de arranque Nuxt; para publicación estática, revisar configuración incorporada al build y páginas generadas.

## Request y respuesta

Request **derivado del código**, no capturado del frontend desplegado:

```http
POST <config.public.apiUrl>/accounts
Content-Type: application/json

{"username":"<usuario>","persona":"<jugador>","password":"<contraseña>"}
```

Respuesta **observada al invocar localmente el controller con el mock**:

```json
{"success":true,"message":"Cuenta creada correctamente","account":{"username":"audit_local_only","persona":"AuditLocalOnly"}}
```

Prueba ejecutada con los archivos TS actuales, transpileModule en memoria y sin editar código: construir `MockNfsAccountProvider`, inyectarlo en `AccountsController`, llamar `create` con username `audit_local_only`, persona `AuditLocalOnly` y contraseña de prueba válida. No existe operación de disco en el mock.

Otra prueba ejecutada: construir `PythonNfsAccountProvider`, sustituir en esa instancia `runBridgeCommand` por una función que resuelve cada uno de `{}`, `{exists:false}` y `{success:true}`; llamar `createAccount`. **Los tres resultados resuelven sin error.** Esta prueba verifica aceptación del contrato, no ejecución del bridge real.

Prueba HTTP local adicional ejecutada con `@nestjs/testing` y `supertest`, controller actual, mock inyectado, prefijo `api` y el mismo ValidationPipe de main. Resultados:

| Request local | Status | Respuesta |
|---|---|---|
| POST válido con los tres campos de la UI | 201 | `success:true`, mensaje y account esperados |
| Repetición del usuario sólo dentro del mock local | 400 | `El nombre de usuario ya está en uso` |
| Username `bad username` | 400 | `Username must contain only letters, numbers, underscores and dashes` |

La repetición local verifica deduplicación en memoria y no forma parte de las cuatro pruebas remotas, que requieren cuentas distintas. No se arrancó AppModule ni se llamó al bridge.

Para reproducir el HTTP local, ejecutar desde raíz con `node` y cargar los TS mediante `typescript.transpileModule` (CommonJS, target ES2022, experimentalDecorators y emitDecoratorMetadata habilitados) o usar archivos dist previamente verificados. Importar `reflect-metadata`, `Test` de `@nestjs/testing`, `ValidationPipe`, `supertest`, AccountsController y MockNfsAccountProvider. Núcleo de la prueba:

```js
const module = await Test.createTestingModule({
  controllers: [AccountsController],
  providers: [{ provide: 'NfsAccountProvider', useValue: new MockNfsAccountProvider() }],
}).compile();
const app = module.createNestApplication();
app.setGlobalPrefix('api');
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
await app.init();
try {
  const result = await request(app.getHttpServer()).post('/api/accounts').send({
    username: 'audit_local_only', persona: 'AuditLocalOnly', password: 'LocalOnly123!',
  });
  console.log(result.status, result.body);
} finally {
  await app.close();
}
```

## Acceso y logs relevantes

DNS local resolvió `nfs-api.acbldeveloper.com` a `187.77.254.207`.

Intento de lectura `curl.exe --max-time 20 -i https://nfs-api.acbldeveloper.com/api`: `curl: (7) Failed to connect ... port 443 ... Could not connect to server`. No se recibió respuesta HTTP.

Intento SSH, usuario root tentativo (no confirmado), BatchMode, host key estricta y timeout 10 segundos: `ssh: connect to host 187.77.254.207 port 22: Permission denied`. Falló antes de autenticar. El entorno tiene red restringida; este resultado no identifica una falla de producción. No se pidió elevación porque sandbox_approval está deshabilitado.

No se accedió a journalctl, NGINX, systemd, procesos ni base de producción. No hay logs remotos ni respuesta del bridge real disponibles. Se pidió al usuario destino SSH y URL exacta del frontend.

## Matriz de pruebas requeridas

### Continuación del diagnóstico

El usuario confirmó la IP SSH `187.77.254.207` y reiteró autorización para inspección y registros controlados, sin reinicios, cambios de configuración, deploy ni correcciones. El usuario SSH y la URL del frontend siguen indicados como placeholders `USUARIO@IP` y `URL_FRONTEND`; se solicitaron los valores reales, sin contraseñas.

Se retomó TASKS.md sin repetir la auditoría local. Nuevo intento de conexión de lectura con root como usuario tentativo, BatchMode, ConnectTimeout=10 y StrictHostKeyChecking=yes: `ssh: connect to host 187.77.254.207 port 22: Permission denied`. El rechazo ocurre al abrir la conexión, antes de autenticar; no demuestra que root sea incorrecto ni que el servicio remoto falle. No hay acceso al servidor para ejecutar systemctl, inspeccionar el entorno efectivo o consultar SQLite. No se enviaron POSTs de producción ni se crearon cuentas remotas durante esta continuación.

Las siete preguntas de producción (URL correcta, provider efectivo, ejecución Python, bridge externo, success del bridge, persistencia y punto de falso éxito) permanecen sin evidencia remota. Las hipótesis locales conservan su estado y no se convierten en conclusiones sobre el VPS.

Actualización posterior: usuario SSH confirmado como `root`. Se reintentó conexión a `root@187.77.254.207` y volvió a fallar con `Permission denied` al conectar al puerto 22, antes de autenticación. No se transmitieron ni almacenaron credenciales. La URL real del frontend sigue pendiente; el obstáculo inmediato es la conexión de red, no una contraseña rechazada.

| Orden | Prueba | Resultado / verificación de SQLite |
|---|---|---|
| 1 | POST desde VPS a `127.0.0.1:3100/api/accounts` | Pendiente: sin SSH |
| 2 | POST a `https://nfs-api.acbldeveloper.com/api/accounts` | Pendiente; lectura HTTPS de diagnóstico falló, no se envió POST |
| 3 | POST con exactamente los campos del frontend | Pendiente en producción; contrato reconstruido localmente |
| 4 | Registro en frontend desplegado | Pendiente: URL y acceso a navegador/captura |

No se omitió la comprobación de SQLite después de un registro remoto: no hubo registros remotos. No se afirma que la API haya recibido ninguno de estos requests.

## Procedimiento reproducible pendiente en VPS

1. Inspeccionar `systemctl show nfs-api -p MainPID -p WorkingDirectory -p ExecStart -p FragmentPath -p DropInPaths`. Revisar unit/drop-ins y EnvironmentFile de forma selectiva, sin volcar secretos.
2. Comparar fuente y `dist` en `/opt/nfs-web`, commit, rutas reales y argv/cwd del proceso MainPID. Inspeccionar sólo variables relevantes: NFS_PROVIDER, NFS_PYTHON_BIN, NFS_BRIDGE_PATH, NFS_SERVER_PATH, PORT, FRONTEND_URL. La ausencia en `/proc/PID/environ` no descarta carga posterior desde dotenv: verificar además archivo resuelto por cwd y lógica del código desplegado.
3. Leer bridge externo y comparar acciones, persistencia, ruta SQLite y contratos. No reemplazarlo por `scripts/nfs-account-bridge.py`. Inspeccionar NGINX con `nginx -T`, server_name, location, proxy_pass y logs asociados; no recargarlo.
4. Capturar runtimeConfig servido al frontend, URL y bundles del formulario. En navegador, pestaña Network/Preserve log: capturar Origin, URL final, método, payload con contraseña redactada, status, cuerpo, preflight, redirects y hora. Revisar si hay service worker/caché o artefactos de otra versión.
5. Elegir cuatro pares distintos, válidos, por ejemplo `aud1_<marca>`, `aud2_<marca>`, `aud3_<marca>`, `aud4_<marca>` y personas distintas, cada string <=20 caracteres. Contraseñas aleatorias de prueba, fuera de documentos/logs compartidos.
6. Antes de cada POST verificar ausencia; después verificar presencia en SQLite abierta `mode=ro` o mediante `cd /opt/NFS-Online-Server` y `python3 nfs_online.py account list`. Si SQLite: inspeccionar esquema primero y consultar sólo el username/persona de prueba; no imprimir hashes, contraseñas ni cuentas ajenas. No modificar el servidor NFS ni eliminar cuentas existentes.
7. Ejecutar en orden las cuatro pruebas de la matriz, conservar request/status/response/hora y prueba de persistencia para cada una. En pruebas 3 y 4 usar exactamente estructura y headers observados, incluyendo Origin para evaluar CORS. Curl no aplica políticas CORS del navegador.
8. Correlacionar journalctl de `nfs-api` y access/error logs NGINX con la ventana de cada prueba. El provider actual no registra cada lanzamiento/stdout/code; ausencia de log de éxito no prueba ausencia de ejecución. Si es necesaria captura del proceso Python, evaluar observación temporal sin modificar código/servicios y sin registrar stdin/contraseñas. No ejecutar de nuevo createAccount con la misma cuenta para obtener stdout. Una llamada directa al bridge con otra cuenta sería una prueba adicional, no evidencia de que la API lo lanzó.

## Causa raíz probable / confirmada

**Confirmado localmente:** hay rutas de falso éxito por mock en memoria, stub de bridge, validación permisiva de resultados y frontend que interpreta sólo HTTP 2xx.

**Hipótesis principal para el incidente:** el API efectivo del frontend usa mock por NFS_PROVIDER ausente/incorrecto, entorno systemd o cwd distinto de las pruebas exitosas previas. Explica éxito coherente en API y UI sin persistencia; **no está confirmado en producción**.

Otras hipótesis: frontend apunta a otro API/instancia; código o bundle desactualizado; API Python invoca un stub o acepta un contrato inesperado/no exitoso por no validar `success === true` ni exit code. El bridge externo puede seguir siendo correcto. CORS/DTO generalmente producen error visible en esta versión; comprobar versión desplegada antes de descartarlos.

## Archivos involucrados y solución propuesta (sin aplicar)

- `apps/api/src/nfs/nfs.module.ts`: validar provider al arrancar; impedir fallback silencioso a mock en producción; registrar provider/ruta sin secretos.
- `apps/api/src/app.module.ts` y despliegue: hacer inequívoca la carga de configuración y validarla. Confirmar primero WorkingDirectory y entorno reales.
- `apps/api/src/nfs/python-nfs-account.provider.ts`: exigir contrato positivo, tratar exit code no cero como error, timeout/manejo de stdin, acciones compatibles y errores de preconsulta visibles; confirmar contrato con bridge real antes de cambiarlo.
- `apps/api/src/accounts/accounts.controller.ts`: preservar tipos de error y entregar éxito sólo tras creación confirmada; eliminar comparación tautológica en una corrección posterior.
- `apps/web/app/pages/registro.vue`: exigir `data.success === true` y respuesta esperada; URL fiable; diagnóstico visible si contrato falla. Esto por sí solo no detecta un mock que devuelve success:true.
- `apps/web/nuxt.config.ts`, variables y artefactos frontend: comprobar URL de producción e impedir localhost accidental según modalidad de despliegue.
- `apps/api/.env.example`: evitar que la plantilla de producción conduzca a mock.
- `scripts/nfs-account-bridge.py`: identificar claramente como stub/evitar su despliegue real. No modificar ni sustituir el bridge externo probado hasta identificar la causa.

Posibles cambios VPS, condicionados a evidencia: entorno/WorkingDirectory de nfs-api, URL frontend, rebuild de artefactos y reinicio del servicio afectado, o proxy_pass/origin si se demuestra desvío. **No ejecutar estos cambios todavía.** Ningún cambio propuesto requiere modificar `/opt/NFS-Online-Server`.

## Riesgos

Las pruebas remotas crean cuentas persistentes y deben usar identidades distintas. Reiniciar API borra estado del mock y puede causar interrupción; rebuild/despliegue sin diagnóstico puede ocultar la causa. El frontend solo no garantiza persistencia. Fallos CORS no pueden diagnosticarse con curl solamente. Un stdout válido y success:true tampoco certifican la ruta SQLite usada por un bridge distinto. Evitar registrar contraseñas o hashes y no compartir dumps completos de entorno/base.


## Evidencia AGY VPS

1. **Provider efectivo en producción:** `NFS_PROVIDER=python` (Confirmado en `/proc/$pid/environ` y archivo `.env` sin errores de salto de línea).
2. **Commit desplegado:** `39268ad` (Merge pull request #3) con modificaciones locales no commiteadas en `apps/api/dist/main.js` (solo el ajuste de bind al puerto local `127.0.0.1`).
3. **WorkingDirectory y ExecStart:**
   - WorkingDirectory: `/opt/nfs-web/apps/api`
   - ExecStart: `/usr/bin/node /opt/nfs-web/apps/api/dist/main.js`
4. **Bridge realmente ejecutado:** `/opt/nfs-web-bridge/nfs-account-bridge.py`. Se comprobó que el script de producción es funcional, exige `action: "createAccount"` y lee la configuración de base de datos desde `/opt/NFS-Online-Server/config/server.toml`.
5. **Resultado TEST 1 (Local VPS):** El API local en 127.0.0.1 respondió `201 Created` con JSON `success: true`.
6. **Resultado TEST 2 (Público VPS):** El API pública a través de NGINX respondió `201 Created` con JSON `success: true`.
7. **Resultado TEST 3 (Payload exacto frontend):** El payload exacto del frontend procesó exitosamente a través de NGINX y NestJS.
8. **Persistencia SQLite de cada test:** Se confirmó persistencia exitosa. Todas las cuentas de prueba (`testbridge1`, `testapi2`, `testpub3`) aparecieron exitosamente en la base de datos real `/opt/NFS-Online-Server/data/accounts.sqlite3` verificadas mediante `nfs_online.py account list`. No existen bases de datos duplicadas o falsas creadas por un `cwd` incorrecto.
9. **URL real utilizada por el frontend:** El runtime config desplegado (visto en JS) apunta a `https://nfs-api.acbldeveloper.com/api`.
10. **Causa raíz confirmada:** La infraestructura de backend de producción (NGINX, NestJS, Python Bridge, SQLite) funciona **perfectamente** y graba de forma confiable sin falsos positivos. El falso éxito (donde reporta éxito pero no graba en el VPS) se origina estrictamente por fuera de la API pública: el navegador del usuario final está enviando la petición a un entorno local de desarrollo o caché que responde éxito, muy probablemente enviando el payload al `http://localhost:3100/api` local del desarrollador donde el `MockNfsAccountProvider` simula un éxito en memoria.
11. **Corrección propuesta:** 
   - Inspeccionar la red desde el navegador para confirmar el envío hacia `localhost:3100` o un destino erróneo.
   - Si el build estático `nfs-static.zip` fue compilado apuntando a localhost, reempaquetarlo asegurando exportar `NUXT_PUBLIC_API_URL=https://nfs-api.acbldeveloper.com/api`.
   - Modificar la validación en `PythonNfsAccountProvider` en el código fuente para que valide el exit code del proceso.
12. **Qué cambios deben hacerse en Git:**
   - Ninguno urgente para corregir el bug de persistencia, dado que el código backend actual funciona bien.
   - En el futuro, mejorar `PythonNfsAccountProvider` para validar el exit code del script hijo en el servidor.
   - Agregar validación en la inicialización de NestJS para abortar si `NFS_PROVIDER` no está configurado explícitamente en lugar de silenciar a Mock.
13. **Qué cambios deben hacerse solamente en el VPS:**
   - Restablecer (checkout) o commitear el cambio manual en `apps/api/dist/main.js` (`127.0.0.1` binding) para mantener integridad en el servidor.
   - Reemplazar/re-desplegar `apps/web/nfs-static.zip` y descomprimirlo en NGINX si se confirma que el empaquetado actual falló en tomar la variable de entorno remota.
