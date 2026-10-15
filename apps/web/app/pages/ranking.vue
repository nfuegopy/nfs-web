<script setup lang="ts">
useSeoMeta({ title: 'Ranking', description: 'Ranking de pilotos del servidor de Need for Speed Underground 2 por modo de juego.' })

interface Board {
  game: string
  category: string
  categories: { id: number; name: string }[]
  rows: { position: number; persona: string; wins: number; losses: number; skill: number }[]
}

const FALLBACK = ['Circuito', 'Sprint', 'Drag', 'Drift', 'Street X', 'URL'].map((name, id) => ({ id, name }))

const api = useApi()
const { account } = useSession()
const category = ref(0)
const board = ref<Board | null>(null)
const error = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    board.value = await api<Board>(`/leaderboard?category=${category.value}`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

watch(category, load)
onMounted(load)

const categories = computed(() => board.value?.categories?.length ? board.value.categories : FALLBACK)
const rate = (r: { wins: number; losses: number }) => (r.wins + r.losses ? Math.round((r.wins / (r.wins + r.losses)) * 100) : 0)
</script>

<template>
  <div class="container page">
    <p class="eyebrow">Underground 2</p>
    <h1>Ranking</h1>
    <p class="muted intro">Ordenado por skill. Sólo cuentan las carreras online terminadas en este servidor.</p>

    <div class="tabs" role="tablist" aria-label="Modo de juego">
      <button
        v-for="c in categories"
        :key="c.id"
        role="tab"
        :aria-selected="category === c.id"
        :class="{ active: category === c.id }"
        @click="category = c.id"
      >
        {{ c.name }}
      </button>
    </div>

    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <div v-else-if="!board" class="skeleton" style="height: 240px" />
    <div v-else-if="!board.rows.length" class="card empty">
      <p class="muted">Nadie corrió {{ board.category }} todavía. Sé el primero en aparecer acá.</p>
      <NuxtLink v-if="!account" to="/registro" class="btn btn-primary">Crear cuenta</NuxtLink>
    </div>
    <div v-else class="table-wrap" :class="{ dim: loading }">
      <table>
        <thead>
          <tr><th>#</th><th>Piloto</th><th class="num">Victorias</th><th class="num">Derrotas</th><th class="num">Efectividad</th><th class="num">Skill</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in board.rows" :key="row.persona" :class="{ me: account && row.persona === account.persona }">
            <td><span class="pos" :class="'p' + row.position">{{ row.position }}</span></td>
            <td>{{ row.persona }}</td>
            <td class="num">{{ row.wins }}</td>
            <td class="num">{{ row.losses }}</td>
            <td class="num">{{ rate(row) }}%</td>
            <td class="num">{{ row.skill }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.intro {
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  margin-bottom: 1.25rem;
}

.tabs button {
  flex: none;
  min-height: 40px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--muted);
  font: 600 0.9rem var(--body);
  cursor: pointer;
}

.tabs button:hover {
  color: var(--text);
}

.tabs button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.dim {
  opacity: 0.6;
}

.pos {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--surface-2);
  font-weight: 700;
  font-size: 0.85rem;
}

.pos.p1 {
  background: var(--accent);
  color: var(--accent-ink);
}

tr.me td {
  background: var(--accent-soft);
}

.empty {
  display: grid;
  justify-items: start;
  gap: 0.5rem;
}
</style>
