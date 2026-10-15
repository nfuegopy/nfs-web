<script setup lang="ts">
defineProps<{ id: string; autocomplete: string; minlength?: number; maxlength?: number; invalid?: boolean }>()
const model = defineModel<string>({ required: true })
const visible = ref(false)
</script>

<template>
  <div class="password">
    <input
      :id="id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      class="input"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :maxlength="maxlength"
      :aria-invalid="invalid || undefined"
      required
    />
    <button
      type="button"
      class="toggle"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-pressed="visible"
      :title="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      @click="visible = !visible"
    >
      <svg v-if="!visible" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10.7 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.9 3.8" />
        <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.9 0 3.6-.6 5-1.5" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="m2 2 20 20" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.password {
  position: relative;
}

.password .input {
  padding-right: 3rem;
}

.toggle {
  position: absolute;
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: none;
  border: 0;
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
}

.toggle:hover,
.toggle:focus-visible {
  color: var(--text);
  background: var(--surface-2);
  outline: none;
}

.toggle svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
