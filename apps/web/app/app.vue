<script setup lang="ts">
useSeoMeta({
  title: 'NFSU2 Online',
  titleTemplate: (title) => (title && title !== 'NFSU2 Online' ? `${title} · NFSU2 Online` : 'NFSU2 Online · Need for Speed Underground 2 multijugador'),
  description: 'Servidor comunitario de Need for Speed Underground 2. Creá tu cuenta, instalá el cliente online y competí con otros pilotos.',
})

const { account, ready, logout } = useSession()
const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (menuOpen.value = false))

async function signOut() {
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="shell">
    <header class="header">
      <div class="container bar">
        <NuxtLink to="/" class="brand" aria-label="Inicio">
          <img src="~/assets/logo.png" alt="Need for Speed Underground 2" />
          <span>Online</span>
        </NuxtLink>

        <button class="menu-btn" :aria-expanded="menuOpen" aria-controls="nav" @click="menuOpen = !menuOpen">
          <span class="sr-only">Menú</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="menuOpen ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'" /></svg>
        </button>

        <nav id="nav" class="nav" :class="{ open: menuOpen }">
          <NuxtLink to="/como-jugar">Cómo jugar</NuxtLink>
          <NuxtLink to="/ranking">Ranking</NuxtLink>
          <template v-if="ready && account">
            <NuxtLink to="/panel" class="nav-user">{{ account.persona }}</NuxtLink>
            <button class="btn btn-ghost nav-btn" @click="signOut">Salir</button>
          </template>
          <template v-else>
            <NuxtLink to="/ingresar">Ingresar</NuxtLink>
            <NuxtLink to="/registro" class="btn btn-primary nav-btn">Crear cuenta</NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>

    <footer class="footer">
      <div class="container foot">
        <span>NFSU2 Online · servidor comunitario</span>
        <span class="muted">Need for Speed es una marca de Electronic Arts. Este proyecto no está afiliado a EA.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(11, 13, 12, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none !important;
}

.brand img {
  height: 38px;
  width: auto;
}

.brand span {
  font-family: var(--display);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  padding-top: 4px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.6rem;
}

.nav a:not(.btn) {
  color: var(--muted);
  font-weight: 500;
  font-size: 0.95rem;
}

.nav a:not(.btn):hover,
.nav a.router-link-active:not(.btn) {
  color: var(--text);
  text-decoration: none;
}

.nav .nav-user {
  color: var(--accent) !important;
  max-width: 14ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-btn {
  min-height: 40px;
  padding: 0 1rem;
}

.menu-btn {
  display: none;
  background: none;
  border: 0;
  color: var(--text);
  width: 44px;
  height: 44px;
  cursor: pointer;
}

.menu-btn svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

@media (max-width: 760px) {
  .menu-btn {
    display: grid;
    place-items: center;
  }

  .nav {
    display: none;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0.5rem 16px 1rem;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }

  .nav.open {
    display: flex;
  }

  .nav a:not(.btn) {
    padding: 0.8rem 0;
    font-size: 1.05rem;
  }

  .nav-btn {
    margin-top: 0.6rem;
    min-height: 46px;
  }
}

.footer {
  border-top: 1px solid var(--border);
  padding: 1.5rem 0;
  font-size: 0.85rem;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2rem;
}
</style>
