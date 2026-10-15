<script setup lang="ts">
useSeoMeta({ title: 'NFSU2 Online' })

interface Summary { players: number; online: number; races: number }
interface Board { rows: { position: number; persona: string; wins: number; losses: number; skill: number }[] }

const api = useApi()
const { account } = useSession()
const summary = ref<Summary | null>(null)
const board = ref<Board | null>(null)

onMounted(async () => {
  const [s, b] = await Promise.allSettled([api<Summary>('/summary'), api<Board>('/leaderboard?category=0')])
  if (s.status === 'fulfilled') summary.value = s.value
  if (b.status === 'fulfilled') board.value = b.value
})
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero-inner">
        <p class="eyebrow">Servidor comunitario · Underground 2</p>
        <h1>Bayview vuelve<br />a tener tráfico</h1>
        <p class="lead">
          Una sola cuenta para entrar al online del juego y seguir tus carreras desde la web.
          Armá tu auto, buscá una sala y corré contra otros pilotos.
        </p>
        <div class="cta">
          <NuxtLink v-if="account" to="/panel" class="btn btn-primary">Ir a mi panel</NuxtLink>
          <NuxtLink v-else to="/registro" class="btn btn-primary">Crear cuenta gratis</NuxtLink>
          <NuxtLink to="/como-jugar" class="btn btn-ghost">Cómo instalarlo</NuxtLink>
        </div>

        <dl class="stats">
          <div>
            <dt>Pilotos registrados</dt>
            <dd>{{ summary?.players ?? '—' }}</dd>
          </div>
          <div>
            <dt>Conectados ahora</dt>
            <dd :class="{ live: summary?.online }">{{ summary?.online ?? '—' }}</dd>
          </div>
          <div>
            <dt>Carreras corridas</dt>
            <dd>{{ summary?.races ?? '—' }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="container steps">
      <article>
        <span class="step-n">01</span>
        <h3>Creá tu cuenta</h3>
        <p class="muted">Usuario, nombre de piloto, email y contraseña. Son los mismos datos que vas a usar en el juego.</p>
      </article>
      <article>
        <span class="step-n">02</span>
        <h3>Instalá el online</h3>
        <p class="muted">Copiá los complementos en la carpeta del juego. La guía te lleva paso a paso.</p>
      </article>
      <article>
        <span class="step-n">03</span>
        <h3>Corré y subí</h3>
        <p class="muted">Cada carrera suma a tus estadísticas y al ranking. Las ves en tu panel.</p>
      </article>
    </section>

    <section class="container ranking-preview">
      <div class="section-head">
        <div>
          <p class="eyebrow">Ranking · Circuito</p>
          <h2>Los más rápidos</h2>
        </div>
        <NuxtLink to="/ranking">Ver ranking completo →</NuxtLink>
      </div>

      <div v-if="!board" class="skeleton" style="height: 180px" />
      <p v-else-if="!board.rows.length" class="card muted">Todavía no hay carreras en el ranking. La primera victoria puede ser tuya.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Piloto</th><th class="num">Victorias</th><th class="num">Derrotas</th><th class="num">Skill</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in board.rows.slice(0, 5)" :key="row.persona">
              <td>{{ row.position }}</td>
              <td>{{ row.persona }}</td>
              <td class="num">{{ row.wins }}</td>
              <td class="num">{{ row.losses }}</td>
              <td class="num">{{ row.skill }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background:
    linear-gradient(90deg, rgba(11, 13, 12, 0.97) 0%, rgba(11, 13, 12, 0.85) 45%, rgba(11, 13, 12, 0.35) 100%),
    linear-gradient(0deg, var(--bg) 0%, transparent 35%),
    url('~/assets/wallpaper.jpeg') center / cover no-repeat;
}

.hero-inner {
  padding-top: clamp(3.5rem, 10vw, 7rem);
  padding-bottom: 3rem;
}

.lead {
  max-width: 34rem;
  font-size: 1.1rem;
  color: #c9d3cd;
  margin-bottom: 2rem;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  max-width: 34rem;
  margin: 3.5rem 0 0;
}

.stats div {
  border-left: 2px solid var(--accent);
  padding-left: 0.9rem;
}

.stats dt {
  font-size: 0.8rem;
  color: var(--muted);
}

.stats dd {
  margin: 0;
  font-family: var(--display);
  font-size: 2.4rem;
  line-height: 1.1;
}

.stats dd.live {
  color: var(--accent);
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  padding-top: 3.5rem;
  padding-bottom: 1rem;
}

.steps article {
  padding: 1.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.step-n {
  font-family: var(--display);
  font-size: 1.3rem;
  color: var(--accent);
}

.steps p {
  margin: 0;
}

.ranking-preview {
  padding-top: 2.5rem;
  padding-bottom: 4rem;
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.section-head h2 {
  margin: 0;
}

@media (max-width: 480px) {
  .stats dd {
    font-size: 1.9rem;
  }

  .cta .btn {
    flex: 1;
  }
}
</style>
