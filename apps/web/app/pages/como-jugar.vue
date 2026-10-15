<script setup lang="ts">
useSeoMeta({
  title: 'Cómo jugar',
  description: 'Guía para instalar Need for Speed Underground 2, el widescreen fix y conectarte al servidor online.',
})

// Todas las descargas están en la misma carpeta compartida.
const DOWNLOADS_URL = 'https://mega.nz/folder/woojgQhZ#DwyfxatJrD-PQteA0BN8TQ'
const GAME_DIR = 'C:\\Program Files (x86)\\Need for Speed Underground 2'
</script>

<template>
  <div class="container page guide">
    <p class="eyebrow">Guía de instalación</p>
    <h1>Cómo jugar online</h1>
    <p class="muted intro">
      Si ya tenés el juego instalado, empezá por el paso 4. Todo lo que hay que descargar está en
      <a :href="DOWNLOADS_URL" target="_blank" rel="noopener noreferrer">esta carpeta</a>.
    </p>

    <ol class="steps">
      <li class="card">
        <h3>Creá tu cuenta</h3>
        <p>
          Registrate en <NuxtLink to="/registro">Crear cuenta</NuxtLink>. Guardá tu usuario y contraseña: son los mismos que vas a
          escribir dentro del juego.
        </p>
      </li>

      <li class="card">
        <h3>Descargá el juego</h3>
        <p>Bajá <strong>las dos partes</strong> y guardalas juntas en la misma carpeta, sin cambiarles el nombre:</p>
        <ul class="files">
          <li><code>Nf2SUnder2grou2nd2EA-elamigos.part1.rar</code></li>
          <li><code>Nf2SUnder2grou2nd2EA-elamigos.part2.rar</code></li>
        </ul>
        <a :href="DOWNLOADS_URL" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Abrir la carpeta de descargas</a>
      </li>

      <li class="card">
        <h3>Extraé e instalá</h3>
        <p>
          Con 7-Zip o WinRAR, hacé clic derecho sobre <code>part1.rar</code> y elegí <strong>Extraer aquí</strong>. La segunda parte se lee
          sola.
        </p>
        <p>
          Vas a obtener una imagen de disco (ISO). En Windows 10 u 11, clic derecho → <strong>Montar</strong>. Abrí la unidad nueva y
          ejecutá el instalador. Te recomendamos dejar la carpeta que propone por defecto:
        </p>
        <p><code class="path">{{ GAME_DIR }}</code></p>
        <p class="muted">Abrí el juego una vez, creá tu perfil para comprobar que arranca y cerralo antes de seguir.</p>
      </li>

      <li class="card">
        <h3>Hacé una copia de seguridad</h3>
        <p>Antes de agregar archivos, guardá una copia de lo que ya tenés. Así, si algo falla, volvés atrás en un minuto.</p>
        <ul class="files">
          <li>
            <strong>Tu partida:</strong> pegá <code>%LOCALAPPDATA%\NFS Underground 2</code> en la barra de direcciones del Explorador y
            copiá esa carpeta a otro lugar (por ejemplo, al Escritorio). Si no aparece ahí, buscá la carpeta
            <code>NFS Underground 2</code> dentro de <strong>Documentos</strong>.
          </li>
          <li><strong>La carpeta del juego:</strong> si ya la tenías modificada, copiala entera antes de seguir.</li>
        </ul>
        <p class="muted">Hacé todos los pasos que siguen con el juego cerrado.</p>
      </li>

      <li class="card">
        <h3>Instalá el online</h3>
        <p>
          Descargá <code>Complementos.rar</code>, extraelo y copiá su contenido dentro de la carpeta del juego, al lado de
          <code>SPEED2.EXE</code>. Si Windows pide permiso de administrador, aceptá; si pregunta, combiná carpetas y reemplazá archivos.
        </p>
        <p class="muted">Los archivos tienen que quedar junto al ejecutable, no dentro de una subcarpeta extra.</p>
      </li>

      <li class="card">
        <h3>Arreglá la pantalla (widescreen fix)</h3>
        <p>
          Sin este arreglo, en monitores modernos la imagen se ve estirada o con bordes. Descargá estos tres archivos de la carpeta de
          descargas:
        </p>
        <ul class="files">
          <li><code>NFSUnderground2.WidescreenFix.asi</code></li>
          <li><code>NFSUnderground2.WidescreenFix.dat</code></li>
          <li><code>NFSUnderground2.WidescreenFix.ini</code></li>
        </ul>
        <p>Copialos, los tres juntos, dentro de la carpeta <code>scripts</code> del juego:</p>
        <p><code class="path">{{ GAME_DIR }}\scripts</code></p>
        <p class="muted">
          Si la carpeta <code>scripts</code> no existe, creala con ese nombre exacto. No cambies el nombre de los archivos ni edites el
          <code>.ini</code> salvo que sepas qué estás tocando.
        </p>
      </li>

      <li class="card">
        <h3>Partida con todo desbloqueado <span class="tag">opcional</span></h3>
        <p>
          Para que nadie tenga que jugar todo el modo historia antes de correr online, compartimos una partida guardada con
          <strong>todos los autos y piezas desbloqueados</strong>. No es la partida original del juego: es una partida avanzada que
          preparamos nosotros y que cualquiera puede descargar, así que todos tienen acceso a los mismos autos.
        </p>
        <p class="muted">Si preferís desbloquear todo jugando, saltá este paso: no es necesario para entrar al servidor.</p>
        <p>
          Extraela dentro de <code>%LOCALAPPDATA%\NFS Underground 2</code> (o la carpeta de partidas que encontraste en el paso 4).
          <strong>Reemplaza tu partida actual</strong>: por eso la copia de seguridad es importante.
        </p>
      </li>

      <li class="card">
        <h3>Entrá al servidor</h3>
        <p>
          Abrí el juego y andá a <strong>Online</strong>. Iniciá sesión con tu usuario y contraseña de esta web, elegí tu piloto y entrá a
          una sala o creá una nueva para correr con tus amigos.
        </p>
      </li>
    </ol>

    <section class="card help">
      <h3>¿Algo no anda?</h3>
      <dl>
        <dt>No se puede extraer el juego</dt>
        <dd>Revisá que las dos partes terminaron de bajarse, que tienen su nombre original y que extraés desde <code>part1.rar</code>.</dd>

        <dt>No aparece el modo online o no conecta</dt>
        <dd>Los complementos tienen que estar en la misma carpeta que <code>SPEED2.EXE</code>.</dd>

        <dt>La imagen se ve mal o el juego no abre después del widescreen fix</dt>
        <dd>
          Sacá los tres archivos <code>NFSUnderground2.WidescreenFix</code> de la carpeta <code>scripts</code> y probá de nuevo. Si así anda,
          volvé a copiarlos desde la carpeta de descargas: puede que alguno se haya bajado incompleto.
        </dd>

        <dt>Perdí mi partida o mis autos</dt>
        <dd>Cerrá el juego y copiá de vuelta la carpeta de tu copia de seguridad en <code>%LOCALAPPDATA%\NFS Underground 2</code>.</dd>

        <dt>Rechaza el usuario o la contraseña</dt>
        <dd>
          Usá los datos de tu cuenta de esta web y revisá mayúsculas y espacios. Podés comprobarlos
          <NuxtLink to="/ingresar">ingresando acá</NuxtLink>. Después de varios intentos fallidos la cuenta se bloquea unos minutos.
        </dd>
      </dl>
      <p class="muted">Si sigue sin funcionar, escribile al administrador con el paso exacto y una captura del error. Nunca compartas tu contraseña.</p>
    </section>
  </div>
</template>

<style scoped>
.guide {
  max-width: 780px;
}

.intro {
  margin-bottom: 2rem;
}

.steps {
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  counter-reset: step;
  display: grid;
  gap: 1rem;
}

/* Sólo los pasos (hijos directos) llevan número; las listas internas no. */
.steps > li {
  counter-increment: step;
  position: relative;
  padding-left: 4.5rem;
}

.steps > li::before {
  content: counter(step, decimal-leading-zero);
  position: absolute;
  left: 1.5rem;
  top: 1.45rem;
  font-family: var(--display);
  font-size: 1.8rem;
  line-height: 1;
  color: var(--accent);
}

.steps h3 {
  margin-bottom: 0.6rem;
}

.steps > li > :last-child {
  margin-bottom: 0;
}

.files {
  list-style: disc;
  padding-left: 1.2rem;
  margin: 0 0 1rem;
  display: grid;
  gap: 0.4rem;
}

.files li::marker {
  color: var(--accent);
}

code {
  overflow-wrap: anywhere;
}

.path {
  display: inline-block;
  padding: 0.35em 0.6em;
}

.tag {
  font-family: var(--body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  vertical-align: middle;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  color: var(--muted);
}

.help dt {
  font-weight: 600;
  margin-top: 1rem;
}

.help dd {
  margin: 0.2rem 0 0;
  color: #c9d3cd;
}

.help > p {
  margin: 1.5rem 0 0;
}

@media (max-width: 520px) {
  .steps > li {
    padding-left: 1.5rem;
    padding-top: 3.4rem;
  }

  .steps > li::before {
    top: 1.3rem;
  }
}
</style>
