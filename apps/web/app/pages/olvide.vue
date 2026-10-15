<script setup lang="ts">
useSeoMeta({ title: 'Recuperar contraseña', robots: 'noindex' })

const api = useApi()
const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { message } = await api<{ message: string }>('/auth/password/forgot', { method: 'POST', body: { email: email.value } })
    sent.value = message
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
    <h1 class="title">Recuperar contraseña</h1>
    <p class="muted intro">Escribí el email con el que te registraste y te mandamos un enlace para elegir una contraseña nueva.</p>

    <div v-if="sent" class="card form">
      <p class="alert alert-success" role="status">{{ sent }}</p>
      <p class="muted small">Revisá también la carpeta de spam. El enlace vence en 30 minutos.</p>
      <NuxtLink to="/ingresar" class="btn btn-ghost btn-block">Volver a ingresar</NuxtLink>
    </div>

    <form v-else class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" class="input" autocomplete="email" required maxlength="254" />
      </div>

      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Enviando…' : 'Enviar enlace' }}
      </button>

      <p class="switch muted"><NuxtLink to="/ingresar">Volver a ingresar</NuxtLink></p>
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

.small {
  font-size: 0.88rem;
  margin: 0;
}

.switch {
  margin: 0;
  text-align: center;
  font-size: 0.92rem;
}
</style>
