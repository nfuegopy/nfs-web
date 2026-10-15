export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3100/api',
    },
  },

  site: {
    url: 'https://nfs.acbldeveloper.com',
    name: 'NFSU2 Online',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [{ name: 'theme-color', content: '#0b0d0c' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/seo'],

  ogImage: { enabled: false },
})
