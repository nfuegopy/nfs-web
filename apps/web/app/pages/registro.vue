<template>
  <div class="register-container">
    <div class="header-section">
      <img src="~/assets/icon.png" alt="NFS Icon" class="mini-icon" />
      <h2 class="title">CREAR CUENTA</h2>
    </div>
    
    <div v-if="successMessage" class="success-alert neon-box">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-alert neon-box">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleRegister" v-if="!successMessage" class="neon-form">
      <div class="form-group">
        <label>NOMBRE DE USUARIO</label>
        <input v-model="form.username" type="text" required minlength="3" maxlength="20" pattern="^[a-zA-Z0-9_-]+$" title="Solo letras, números, guiones y guiones bajos" />
      </div>

      <div class="form-group">
        <label>NOMBRE EN EL JUEGO (PERSONA)</label>
        <input v-model="form.persona" type="text" required minlength="3" maxlength="20" />
      </div>

      <div class="form-group">
        <label>CONTRASEÑA</label>
        <div class="password-wrapper">
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required minlength="8" maxlength="64" />
          <button type="button" class="toggle-password" @click="showPassword = !showPassword" title="Mostrar/Ocultar contraseña">
            <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="eye-icon" />
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>CONFIRMAR CONTRASEÑA</label>
        <div class="password-wrapper">
          <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required />
          <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword" title="Mostrar/Ocultar contraseña">
            <UIcon :name="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="eye-icon" />
          </button>
        </div>
      </div>

      <button type="submit" :disabled="loading" class="neon-btn">
        {{ loading ? 'CREANDO...' : 'REGISTRARSE' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const form = reactive({
  username: '',
  persona: '',
  password: '',
  confirmPassword: ''
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden';
    return;
  }

  loading.value = true;
  
  try {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiUrl || 'http://localhost:3100/api';
    
    const response = await fetch(`${apiUrl}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.username,
        persona: form.persona,
        password: form.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear la cuenta');
    }

    successMessage.value = 'Cuenta creada correctamente. ¡Enciende los motores, ya puedes conectarte!';
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  background: rgba(0, 0, 0, 0.8);
  padding: 3rem;
  border: 1px solid #00ff00;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.2), inset 0 0 20px rgba(0, 255, 0, 0.1);
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

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: #00ff00;
  letter-spacing: 1px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  outline: none;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.toggle-password:hover {
  filter: grayscale(0%) drop-shadow(0 0 5px #00ff00);
}

.eye-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #00ff00;
}

input {
  width: 100%;
  padding: 1rem;
  padding-right: 3rem; /* Espacio para el icono de contraseña */
  border: 1px solid #333;
  border-bottom: 2px solid #00ff00;
  border-radius: 4px;
  background-color: rgba(20, 20, 20, 0.9);
  color: #fff;
  font-size: 1.2rem;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #00ff00;
  background-color: rgba(0, 40, 0, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
}

.neon-btn {
  width: 100%;
  background-color: transparent;
  color: #00ff00;
  padding: 1rem;
  margin-top: 1rem;
  border: 2px solid #00ff00;
  border-radius: 4px;
  font-size: 2rem;
  font-family: 'Teko', sans-serif;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
  text-shadow: 0 0 5px #00ff00;
}

.neon-btn:hover:not(:disabled) {
  background-color: #00ff00;
  color: #000;
  box-shadow: 0 0 20px #00ff00;
  text-shadow: none;
}

.neon-btn:disabled {
  border-color: #555;
  color: #555;
  text-shadow: none;
  box-shadow: none;
  cursor: not-allowed;
}

.neon-box {
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  font-family: 'Arial', sans-serif;
  font-size: 1.1rem;
  text-align: center;
}

.error-alert {
  border: 1px solid #ff003c;
  background-color: rgba(255, 0, 60, 0.1);
  color: #ff003c;
  box-shadow: 0 0 15px rgba(255, 0, 60, 0.3);
}

.success-alert {
  border: 1px solid #00ff00;
  background-color: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
}
</style>
