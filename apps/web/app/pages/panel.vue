<script setup lang="ts">
useSeoMeta({ title: 'Mi panel', robots: 'noindex' })

interface Stat { persona: string; game: string; category: string; wins: number; losses: number; disconnects: number; skill: number; rank: number }
interface Race {
  persona: string; game: string; category: string; track: string; laps: number; ranked: boolean
  outcome: string; place: number; timeMs: number; bestLapMs: number; bestDrift: number; disconnected: boolean; date: number
}
interface Profile {
  account: { username: string; email: string; createdAt: number; online: { game: string } | null }
  personas: { name: string; primary: boolean }[]
  stats: Stat[]
  races: Race[]
}

const api = useApi()
const session = useSession()
const route = useRoute()
const profile = ref<Profile | null>(null)
const error = ref('')
const welcome = computed(() => route.query.nueva === '1')

async function load() {
  try {
    profile.value = await api<Profile>('/me/profile')
  } catch (e) {
    if ((e as { status?: number }).status === 401) {
      session.account.value = null
      return navigateTo('/ingresar?volver=/panel')
    }
    error.value = (e as Error).message
  }
}

onMounted(load)

const played = computed(() => (profile.value?.stats ?? []).filter((s) => s.wins + s.losses > 0))
const totals = computed(() => {
  const wins = played.value.reduce((n, s) => n + s.wins, 0)
  const losses = played.value.reduce((n, s) => n + s.losses, 0)
  const races = wins + losses
  return { wins, losses, races, rate: races ? Math.round((wins / races) * 100) : 0 }
})
const bestSkill = computed(() => Math.max(0, ...played.value.map((s) => s.skill)))

const rate = (s: Stat) => (s.wins + s.losses ? Math.round((s.wins / (s.wins + s.losses)) * 100) : 0)
const memberSince = (ts: number) => new Date(ts * 1000).toLocaleDateString('es', { month: 'long', year: 'numeric' })
const dateTime = (ts: number) => new Date(ts * 1000).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
function lapTime(ms: number) {
  if (!ms) return '—'
  const m = Math.floor(ms / 60000)
  const s = ((ms % 60000) / 1000).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="container page">
    <p v-if="welcome" class="alert alert-success welcome">
      ¡Listo! Tu cuenta quedó creada. Ya podés entrar al online del juego con tu usuario y contraseña.
      <NuxtLink to="/como-jugar">Ver cómo instalarlo</NuxtLink>
    </p>

    <p v-if="error" class="alert alert-error">{{ error }}</p>

    <template v-else-if="!profile">
      <div class="skeleton" style="height: 120px; margin-bottom: 1rem" />
      <div class="skeleton" style="height: 260px" />
    </template>

    <template v-else>
      <section class="head">
        <div>
          <p class="eyebrow">Mi panel</p>
          <h1>{{ profile.personas.find((p) => p.primary)?.name ?? profile.account.username }}</h1>
          <p class="muted meta">
            Usuario <strong>{{ profile.account.username }}</strong>
            <template v-if="profile.account.email"> · {{ profile.account.email }}</template>
            · Piloto desde {{ memberSince(profile.account.createdAt) }}
          </p>
        </div>
        <span v-if="profile.account.online" class="badge badge-live">Conectado en {{ profile.account.online.game }}</span>
        <span v-else class="badge">Desconectado</span>
      </section>

      <section class="kpis">
        <div class="card kpi">
          <span>Carreras</span>
          <strong>{{ totals.races }}</strong>
        </div>
        <div class="card kpi">
          <span>Victorias</span>
          <strong>{{ totals.wins }}</strong>
        </div>
        <div class="card kpi">
          <span>Efectividad</span>
          <strong>{{ totals.rate }}%</strong>
          <div class="bar"><i :style="{ width: totals.rate + '%' }" /></div>
        </div>
        <div class="card kpi">
          <span>Mejor skill</span>
          <strong>{{ bestSkill || '—' }}</strong>
        </div>
      </section>

      <section v-if="!played.length" class="card empty">
        <h3>Todavía no corriste online</h3>
        <p class="muted">Cuando termines tu primera carrera en el servidor, vas a ver acá tus victorias, tu efectividad por modo y tus mejores vueltas.</p>
        <NuxtLink to="/como-jugar" class="btn btn-ghost">Cómo conectarte al servidor</NuxtLink>
      </section>

      <template v-else>
        <section class="block">
          <h2>Por modo de juego</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Modo</th><th class="num">Victorias</th><th class="num">Derrotas</th>
                  <th>Efectividad</th><th class="num">Skill</th><th class="num">Desconexiones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in played" :key="s.persona + s.game + s.category">
                  <td>{{ s.category }} <span class="muted small">· {{ s.game }}</span></td>
                  <td class="num">{{ s.wins }}</td>
                  <td class="num">{{ s.losses }}</td>
                  <td>
                    <div class="rate"><div class="bar"><i :style="{ width: rate(s) + '%' }" /></div>{{ rate(s) }}%</div>
                  </td>
                  <td class="num">{{ s.skill }}</td>
                  <td class="num">{{ s.disconnects }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="block">
          <h2>Últimas carreras</h2>
          <p v-if="!profile.races.length" class="muted">Sin carreras registradas todavía.</p>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Modo</th><th>Pista</th><th>Resultado</th><th class="num">Tiempo</th><th class="num">Mejor vuelta</th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in profile.races" :key="i">
                  <td>{{ dateTime(r.date) }}</td>
                  <td>{{ r.category }}<span v-if="r.ranked" class="muted small"> · ranked</span></td>
                  <td>{{ r.track }}<span v-if="r.laps > 1" class="muted small"> · {{ r.laps }} vueltas</span></td>
                  <td>
                    <span v-if="r.disconnected" class="badge">Desconectado</span>
                    <span v-else-if="r.outcome === 'WIN'" class="badge badge-live">1° · Victoria</span>
                    <span v-else class="badge">{{ r.place ? r.place + '°' : 'Derrota' }}</span>
                  </td>
                  <td class="num">{{ lapTime(r.timeMs) }}</td>
                  <td class="num">{{ lapTime(r.bestLapMs) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <section class="block">
        <h2>Seguridad</h2>
        <ChangePasswordForm />
      </section>

      <section v-if="profile.personas.length > 1" class="block">
        <h2>Tus pilotos</h2>
        <div class="personas">
          <span v-for="p in profile.personas" :key="p.name" class="badge" :class="{ 'badge-live': p.primary }">{{ p.name }}</span>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.welcome {
  margin-bottom: 1.5rem;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.head h1 {
  font-size: clamp(2.4rem, 6vw, 3.4rem);
  margin: 0;
}

.meta {
  margin: 0.25rem 0 0;
  font-size: 0.92rem;
  overflow-wrap: anywhere;
}

.meta strong {
  color: var(--text);
  font-weight: 600;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi {
  padding: 1.2rem 1.4rem;
  display: grid;
  gap: 0.2rem;
}

.kpi span {
  font-size: 0.82rem;
  color: var(--muted);
}

.kpi strong {
  font-family: var(--display);
  font-size: 2.6rem;
  font-weight: 600;
  line-height: 1;
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
  min-width: 70px;
}

.bar i {
  display: block;
  height: 100%;
  background: var(--accent);
  border-radius: inherit;
}

.rate {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.rate .bar {
  flex: 1;
}

.small {
  font-size: 0.82rem;
}

.block {
  margin-bottom: 2.5rem;
}

.empty h3 {
  margin-bottom: 0.4rem;
}

.personas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
