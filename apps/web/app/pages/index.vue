<template>
  <div class="home-container">
    <div class="icon-wrapper">
      <img src="~/assets/icon.png" alt="NFS Icon" class="nfs-icon" />
    </div>
    <h1 class="title">Need for Speed Underground 2 Online</h1>
    <p class="subtitle">Conquista las calles de Bayview online con otros jugadores. Modifica tu coche, compite y conviértete en el mejor.</p>
    
    <div style="max-width: 600px; margin: 0 auto 2rem auto; text-align: left;">
      <UAlert
        title="¡Servidores en Línea!"
        description="Los servidores están funcionando perfectamente. ¡Crea tu cuenta y únete a la carrera!"
        icon="i-heroicons-light-bulb"
        color="green"
        variant="subtle"
      />
    </div>

    <div class="actions">
      <NuxtLink to="/registro" class="neon-btn">CREAR CUENTA</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 12px;
  box-shadow: inset 0 0 20px rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(5px);
}

.icon-wrapper {
  margin-bottom: 1.5rem;
}

.nfs-icon {
  width: 120px;
  filter: drop-shadow(0 0 10px #00ff00);
  animation: pulse 2s infinite;
}

.title {
  font-size: 4rem;
  color: #fff;
  text-transform: uppercase;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 15px #00ff00;
  line-height: 1.1;
}

.subtitle {
  font-size: 1.5rem;
  color: #ccc;
  margin-bottom: 3rem;
  font-family: Arial, sans-serif;
}

.neon-btn {
  display: inline-block;
  background-color: transparent;
  color: #00ff00;
  padding: 1rem 3rem;
  font-size: 2rem;
  text-decoration: none;
  border: 2px solid #00ff00;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 3px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3), inset 0 0 15px rgba(0, 255, 0, 0.3);
  text-shadow: 0 0 5px #00ff00;
}

.neon-btn:hover {
  background-color: #00ff00;
  color: #000;
  box-shadow: 0 0 30px #00ff00, inset 0 0 20px #00ff00;
  text-shadow: none;
}

@keyframes pulse {
  0% { filter: drop-shadow(0 0 5px #00ff00); }
  50% { filter: drop-shadow(0 0 20px #00ff00); }
  100% { filter: drop-shadow(0 0 5px #00ff00); }
}
</style>
