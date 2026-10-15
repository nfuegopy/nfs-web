<script setup lang="ts">
useSeoMeta({
  title: 'Cómo jugar',
  description: 'Guía para instalar Need for Speed Underground 2 y conectarte al servidor online.',
})

const GAME_URL = 'https://mega.nz/folder/woojgQhZ#DwyfxatJrD-PQteA0BN8TQ'
</script>

<template>
  <div class="container page guide">
    <p class="eyebrow">Guía de instalación</p>
    <h1>Cómo jugar online</h1>
    <p class="muted intro">Son cinco pasos. Si ya tenés el juego instalado, empezá por el paso 4.</p>

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
        <ul>
          <li><code>Nf2SUnder2grou2nd2EA-elamigos.part1.rar</code></li>
          <li><code>Nf2SUnder2grou2nd2EA-elamigos.part2.rar</code></li>
        </ul>
        <a :href="GAME_URL" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Abrir la descarga</a>
      </li>

      <li class="card">
        <h3>Extraé e instalá</h3>
        <p>
          Con 7-Zip o WinRAR, hacé clic derecho sobre <code>part1.rar</code> y elegí <strong>Extraer aquí</strong>. La segunda parte se lee
          sola.
        </p>
        <p>
          Vas a obtener una imagen de disco (ISO). En Windows 10 u 11, clic derecho → <strong>Montar</strong>. Abrí la unidad nueva, ejecutá el
          instalador y anotá en qué carpeta queda el juego.
        </p>
        <p class="muted">Abrí el juego una vez para comprobar que arranca y cerralo antes de seguir.</p>
      </li>

      <li class="card">
        <h3>Instalá el online</h3>
        <p>
          Extraé el paquete de complementos online y copiá su contenido en la carpeta del juego, al lado de <code>SPEED2.EXE</code>. Si
          Windows pregunta, aceptá combinar carpetas y reemplazar archivos.
        </p>
        <p class="muted">
          Los archivos tienen que quedar directamente junto al ejecutable, no dentro de otra subcarpeta.
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

.steps li {
  counter-increment: step;
  position: relative;
  padding-left: 4.5rem;
}

.steps li::before {
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

.steps p:last-child,
.steps ul:last-child {
  margin-bottom: 0;
}

.steps ul {
  padding-left: 1.2rem;
  margin: 0 0 1rem;
  overflow-wrap: anywhere;
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
  .steps li {
    padding-left: 1.5rem;
    padding-top: 3.4rem;
  }

  .steps li::before {
    top: 1.3rem;
  }
}
</style>
