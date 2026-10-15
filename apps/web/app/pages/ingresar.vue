<script setup lang="ts">
useSeoMeta({ title: 'Ingresar' })

const session = useSession()
const route = useRoute()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await session.login(form.username, form.password)
    const next = typeof route.query.volver === 'string' && route.query.volver.startsWith('/') ? route.query.volver : '/panel'
    await navigateTo(next)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container narrow page">
    <p class="eyebrow">Tu cuenta</p>
    <h1 class="title">Ingresar</h1>
    <p class="muted intro">Usá el mismo usuario y contraseña que en el juego.</p>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="username">Usuario</label>
        <input
          id="username"
          v-model="form.username"
          class="input"
          autocomplete="username"
          required
          spellcheck="false"
          autocapitalize="off"
        />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <PasswordInput id="password" v-model="form.password" autocomplete="current-password" />
        <NuxtLink to="/olvide" class="forgot">¿Olvidaste tu contraseña?</NuxtLink>
      </div>

      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Ingresando…' : 'Ingresar' }}
      </button>

      <p class="switch muted">¿Todavía no tenés cuenta? <NuxtLink to="/registro">Creala acá</NuxtLink></p>
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

.forgot {
  justify-self: end;
  font-size: 0.85rem;
}

.switch {
  margin: 0;
  text-align: center;
  font-size: 0.92rem;
}
</style>
