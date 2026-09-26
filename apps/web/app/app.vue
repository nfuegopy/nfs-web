<script setup>
useSeoMeta({
  title: 'NFSU2 Online - Portal Web',
  description: 'Únete a la comunidad de Need for Speed Underground 2 Online. Regístrate, aprende a jugar y compite.',
  ogImage: '/logo.png', // Assuming logo.png is in public or assets
})
</script>

<template>
  <div class="app-layout">
    <div class="background-overlay"></div>
    <header class="header">
      <nav>
        <div class="logo-container">
          <img src="~/assets/logo.png" alt="NFSU2 Logo" class="logo" />
        </div>
        <ul>
          <li><NuxtLink to="/">Inicio</NuxtLink></li>
          <li><NuxtLink to="/como-jugar">Cómo Jugar</NuxtLink></li>
          <li><NuxtLink to="/registro">Registro</NuxtLink></li>
        </ul>
      </nav>
    </header>
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&display=swap');

body {
  font-family: 'Teko', Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #050505;
  background-image: url('~/assets/wallpaper.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: #fff;
  font-size: 1.2rem;
}

.app-layout {
  min-height: 100vh;
  position: relative;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: -1;
}

.header {
  background: linear-gradient(180deg, rgba(0,255,0,0.15) 0%, rgba(0,0,0,0.8) 100%);
  border-bottom: 2px solid #00ff00;
  padding: 1rem 2rem;
  box-shadow: 0 4px 15px rgba(0, 255, 0, 0.2);
}

.header nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-container .logo {
  height: 60px;
  filter: drop-shadow(0 0 5px #00ff00);
}

.header ul {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.header a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.header a:hover, .header a.router-link-active {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
}

.main-content {
  padding: 3rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}
</style>
