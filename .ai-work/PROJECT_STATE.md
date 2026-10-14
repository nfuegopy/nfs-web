# Estado del proyecto

Actualizado: 2026-10-03. Repo auditado: nfs-web, HEAD `ed34ac2`.

## Producción confirmada en el VPS

- NFS fuente de verdad: `/opt/NFS-Online-Server`; SQLite `data/accounts.sqlite3`.
- Bridge real: `/opt/nfs-web-bridge/nfs-account-bridge.py`.
- Proyecto `/opt/nfs-web`; servicio `nfs-api`; API 127.0.0.1:3100, NGINX y `https://nfs-api.acbldeveloper.com`.
- **Backend productivo validado exitosamente:** El stack (NGINX -> NestJS -> Provider Python -> Bridge -> SQLite) funciona a la perfección. Cuentas de prueba enviadas directamente a la API pública fueron creadas exitosamente en la BD real.

## Evidencia del Incidente (Falso Éxito)

- El incidente actual (el frontend informa éxito pero la cuenta no aparece en NFS) **no es provocado por fallos en el backend ni en la base de datos de producción**.
- La investigación apunta a un problema del lado del cliente (navegador/frontend). Es altamente probable que el request nunca llegue a la API de producción, sino que sea desviado localmente (e.g. `localhost:3100`), reciba una respuesta falsa en caché, o el payload se malforme de alguna manera no detectada.

## Estado de Modificaciones en el VPS

- Código compilado (`main.js`) modificado localmente en el servidor para añadir el bind a `127.0.0.1`.
- `NFS_PROVIDER=python` configurado y validado sin caracteres corruptos.
- No se han aplicado parches al código del repositorio; la auditoría en el servidor fue únicamente de lectura y pruebas de persistencia aisladas.

## Próximo Paso (Pendiente)

- **Test del navegador:** Realizar un registro real a través de la página desplegada `https://nfs.acbldeveloper.com/registro` utilizando las herramientas de desarrollo (F12, pestaña Network) para capturar el destino exacto (Request URL), código de estado (Status Code) y respuesta devuelta por el servidor a la llamada fetch, para confirmar la causa raíz. No se realizará ninguna corrección hasta no tener esta evidencia.
