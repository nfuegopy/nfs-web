<script setup lang="ts">
import type { Account } from '~/composables/useSession'

useSeoMeta({ title: 'Crear cuenta' })

const api = useApi()
const session = useSession()

const form = reactive({ username: '', persona: '', email: '', password: '', confirm: '' })
const loading = ref(false)
const error = ref('')

const mismatch = computed(() => form.confirm.length > 0 && form.password !== form.confirm)

async function submit() {
  error.value = ''
  if (form.password !== form.confirm) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true
  try {
    const { account } = await api<{ account: Account }>('/accounts', {
      method: 'POST',
      body: { username: form.username, persona: form.persona, email: form.email, password: form.password },
    })
    session.set(account)
    await navigateTo('/panel?nueva=1')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container narrow page">
    <p class="eyebrow">Nueva cuenta</p>
    <h1 class="title">Creá tu cuenta</h1>
    <p class="muted intro">Con estos datos entrás al online del juego y a tu panel en esta web.</p>

    <form class="card form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="username">Usuario</label>
        <input
          id="username"
          v-model="form.username"
          class="input"
          autocomplete="username"
          required
          minlength="3"
          maxlength="20"
          pattern="[A-Za-z0-9_\-]+"
          spellcheck="false"
          autocapitalize="off"
        />
        <span class="hint">3 a 20 caracteres: letras, números, guiones o guiones bajos. Lo usás para iniciar sesión.</span>
      </div>

      <div class="field">
        <label for="persona">Nombre de piloto</label>
        <input id="persona" v-model="form.persona" class="input" required minlength="3" maxlength="20" />
        <span class="hint">Es el nombre que ven los demás en las salas y en el ranking.</span>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" class="input" autocomplete="email" required maxlength="254" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <PasswordInput id="password" v-model="form.password" autocomplete="new-password" :minlength="8" :maxlength="64" />
        <span class="hint">Mínimo 8 caracteres.</span>
      </div>

      <div class="field">
        <label for="confirm">Repetí la contraseña</label>
        <PasswordInput id="confirm" v-model="form.confirm" autocomplete="new-password" :maxlength="64" :invalid="mismatch" />
        <span v-if="mismatch" class="hint error-hint">Las contraseñas no coinciden.</span>
      </div>

      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
      </button>

      <p class="switch muted">¿Ya tenés cuenta? <NuxtLink to="/ingresar">Ingresá</NuxtLink></p>
    </form>
  </div>
</template>

<style scoped>
.title {
  font-size: clamp(2.4rem, 6vw, 3.2rem);
}

.intro {
  margin-bottom: 1.5rem;
}

.error-hint {
  color: var(--danger);
}

.switch {
  margin: 0;
  text-align: center;
  font-size: 0.92rem;
}
</style>
