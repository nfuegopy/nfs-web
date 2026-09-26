<template>
  <div class="guide-container">
    <div class="header-section">
      <img src="~/assets/icon.png" alt="NFS Icon" class="mini-icon" />
      <h2 class="title">CÓMO JUGAR ONLINE</h2>
    </div>

    <div class="guide-content">
      <div class="step-card">
        <h3>1. Crear tu cuenta</h3>
        <p>
          Entrá en <NuxtLink to="/registro" target="_blank" class="text-link">Crear cuenta</NuxtLink> en esta web. Elegí tu nombre de usuario y contraseña y guárdalos: usarás esos mismos datos al entrar al modo online del juego. Si la web muestra un error, no intentes crear otra cuenta con el mismo nombre sin comprobar primero si la primera se registró.
        </p>
      </div>

      <div class="step-card">
        <h3>2. Descargar el juego</h3>
        <p>
          En la carpeta de descarga indicada, descargá <strong>las dos partes completas</strong>:
        </p>
        <ul>
          <li><code>Nf2SUnder2grou2nd2EA-elamigos.part1.rar</code></li>
          <li><code>Nf2SUnder2grou2nd2EA-elamigos.part2.rar</code></li>
        </ul>
        <p>
          Guardá ambos archivos en <strong>la misma carpeta</strong>. No cambies sus nombres ni intentes extraer la parte 2 por separado. 
        </p>
        <a href="https://mega.nz/folder/woojgQhZ#DwyfxatJrD-PQteA0BN8TQ" target="_blank" rel="noopener noreferrer" class="neon-btn-small">Descargar Juego Base</a>
      </div>

      <div class="step-card">
        <h3>3. Extraer e instalar</h3>
        <p>
          Con 7-Zip o WinRAR, hacé clic derecho sobre <strong><code>...part1.rar</code></strong> y elegí <strong>Extraer aquí</strong>. El programa leerá la segunda parte automáticamente.
        </p>
        <p>
          Una vez extraído, obtendrás un archivo de imagen de disco (ISO). <strong>Debes montar este disco en una unidad virtual</strong> para instalarlo (en Windows 10/11 basta con hacer clic derecho sobre el archivo y elegir <strong>"Montar"</strong>). 
        </p>
        <p>
          Luego, ve a "Este equipo", abre la nueva unidad montada y ejecuta el instalador. Completá la instalación y anotá dónde quedó instalado el juego.
        </p>
        <p class="note">
          Abrí el juego una vez para comprobar que inicia y luego ciérralo antes de continuar.
        </p>
      </div>

      <div class="step-card">
        <h3>4. Descargar e instalar complementos online</h3>
        <p>
          Descargá los complementos online y extraé el paquete en la carpeta principal del juego donde se encuentra el ejecutable (<em>SPEED2.EXE</em>). Asegúrate de combinar carpetas o reemplazar archivos si Windows te lo pide.
        </p>
        <div class="code-block">
          Carpeta donde está instalado NFS Underground 2/<br>
          ├── SPEED2.EXE<br>
          ├── [archivo cargador .dll]<br>
          ├── [carpeta del script]/<br>
          ├── net_u2.asi (si aplica)<br>
          └── net_u2.ini (si aplica)
        </div>
      </div>

      <div class="step-card">
        <h3>5. Entrar al servidor</h3>
        <p>
          Abrí el juego y ve a la sección <strong>Online</strong>. Cuando aparezca el inicio de sesión, escribí el <strong>usuario y la contraseña creados en la web</strong>. Selecciona o crea tu perfil y busca o crea una sala para jugar.
        </p>
      </div>

      <div class="troubleshooting">
        <h3>¿Problemas?</h3>
        <ul>
          <li><strong>No se puede extraer el juego:</strong> Asegúrate de que ambas partes conservan sus nombres originales y extraé desde <code>part1.rar</code>.</li>
          <li><strong>No aparece el modo online:</strong> Verifica que los complementos (.dll, scripts) estén directamente en la carpeta del ejecutable.</li>
          <li><strong>Rechaza el usuario o contraseña:</strong> Revisa mayúsculas, espacios y que la cuenta fue creada correctamente en esta web.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-container {
  background: rgba(0, 0, 0, 0.85);
  padding: 3rem;
  border: 1px solid #00ff00;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 1rem;
}

.mini-icon {
  width: 50px;
  filter: drop-shadow(0 0 5px #00ff00);
}

.title {
  font-size: 3rem;
  color: #fff;
  margin: 0;
  text-shadow: 0 0 10px #00ff00;
}

.guide-content {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  font-size: 1.1rem;
}

.step-card {
  background: rgba(20, 20, 20, 0.6);
  border-left: 4px solid #00ff00;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 0 8px 8px 0;
}

h3 {
  color: #00ff00;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.text-link {
  color: #00ff00;
  text-decoration: underline;
  font-weight: bold;
}

.text-link:hover {
  text-shadow: 0 0 5px #00ff00;
}

ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

code {
  background: #222;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #00ff00;
}

.note {
  font-style: italic;
  color: #aaa;
  margin-top: 1rem;
}

.code-block {
  background: #111;
  border: 1px solid #333;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  color: #00ff00;
  margin-top: 1rem;
}

.troubleshooting {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(50, 0, 0, 0.5);
  border: 1px solid #ff003c;
  border-radius: 8px;
}

.troubleshooting h3 {
  color: #ff003c;
  border-bottom: 1px solid #ff003c;
  padding-bottom: 0.5rem;
}

.troubleshooting strong {
  color: #ffaa00;
}

.neon-btn-small {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #00ff00;
  border: 1px solid #00ff00;
  text-decoration: none;
  font-family: 'Teko', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.neon-btn-small:hover {
  background: #00ff00;
  color: #000;
  box-shadow: 0 0 10px #00ff00;
}
</style>
