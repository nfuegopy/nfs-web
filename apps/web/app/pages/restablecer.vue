<script setup lang="ts">
useSeoMeta({ title: 'Nueva contraseña', robots: 'noindex' })

const api = useApi()
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const form = reactive({ password: '', confirm: '' })
const loading = ref(false)
const error = ref('')
const done = ref('')
const mismatch = computed(() => form.confirm.length > 0 && form.password !== form.confirm)

async function submit() {
  error.value = ''
  if (form.password !== form.confirm) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  loading.value = true
  try {
    const { message } = await api<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: { token: token.value, newPassword: form.password },
    })
    done.value = message
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
    <h1 class="title">Nueva contraseña</h1>

    <div v-if="done" class="card form">
      <p class="alert alert-success" role="status">{{ done }}</p>
      <p class="muted small">La contraseña nueva también es la que usás para entrar al online del juego.</p>
      <NuxtLink to="/ingresar" class="btn btn-primary btn-block">Ingresar</NuxtLink>
    </div>

    <div v-else-if="!token" class="card form">
      <p class="alert alert-error">Este enlace no es válido. Pedí uno nuevo desde "Olvidé mi contraseña".</p>
      <NuxtLink to="/olvide" class="btn btn-ghost btn-block">Pedir un enlace nuevo</NuxtLink>
    </div>

    <form v-else class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="password">Contraseña nueva</label>
        <PasswordInput id="password" v-model="form.password" autocomplete="new-password" :minlength="8" :maxlength="64" />
        <span class="hint">Mínimo 8 caracteres.</span>
      </div>

      <div class="field">
        <label for="confirm">Repetí la contraseña</label>
        <PasswordInput id="confirm" v-model="form.confirm" autocomplete="new-password" :maxlength="64" :invalid="mismatch" />
        <span v-if="mismatch" class="hint error-hint">Las contraseñas no coinciden.</span>
      </div>

      <p v-if="error" class="alert alert-error" role="alert">
        {{ error }}
        <NuxtLink v-if="error.includes('enlace')" to="/olvide">Pedir uno nuevo</NuxtLink>
      </p>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Guardando…' : 'Guardar contraseña' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.title {
  font-size: clamp(2.4rem, 6vw, 3.2rem);
  margin-bottom: 1.5rem;
}

.small {
  font-size: 0.88rem;
  margin: 0;
}

.error-hint {
  color: var(--danger);
}
</style>
