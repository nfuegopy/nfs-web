<script setup lang="ts">
const api = useApi()
const form = reactive({ current: '', password: '', confirm: '' })
const loading = ref(false)
const error = ref('')
const done = ref('')
const mismatch = computed(() => form.confirm.length > 0 && form.password !== form.confirm)

async function submit() {
  error.value = ''
  done.value = ''
  if (form.password !== form.confirm) {
    error.value = 'Las contraseñas nuevas no coinciden.'
    return
  }
  loading.value = true
  try {
    const { message } = await api<{ message: string }>('/auth/password', {
      method: 'POST',
      body: { currentPassword: form.current, newPassword: form.password },
    })
    done.value = message
    Object.assign(form, { current: '', password: '', confirm: '' })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="card form" @submit.prevent="submit">
    <div class="field">
      <label for="current">Contraseña actual</label>
      <PasswordInput id="current" v-model="form.current" autocomplete="current-password" />
    </div>
    <div class="grid">
      <div class="field">
        <label for="new">Contraseña nueva</label>
        <PasswordInput id="new" v-model="form.password" autocomplete="new-password" :minlength="8" :maxlength="64" />
      </div>
      <div class="field">
        <label for="confirm-new">Repetila</label>
        <PasswordInput id="confirm-new" v-model="form.confirm" autocomplete="new-password" :maxlength="64" :invalid="mismatch" />
      </div>
    </div>
    <p class="hint muted">Es la misma contraseña que usás en el juego: después del cambio, entrá al online con la nueva.</p>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <p v-if="done" class="alert alert-success" role="status">{{ done }}</p>

    <div>
      <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Guardando…' : 'Cambiar contraseña' }}</button>
    </div>
  </form>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.1rem;
}

.hint {
  font-size: 0.85rem;
  margin: 0;
}
</style>
