// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@unocss/nuxt',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
  ],

  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/css/leaflet.css',
    '~/assets/css/quantic-colors.css',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  features: {
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  nitro: {
    compressPublicAssets: true,
    minify: true,
  },

  experimental: {
    payloadExtraction: false,
    viewTransition: true,
  },

  routeRules: {
    '/': { prerender: true },
    '/pointFrais': {
      ssr: true,
      headers: { 'cache-control': 's-maxage=300' },
    },
    '/analytics': {
      ssr: true,
      headers: { 'cache-control': 's-maxage=600' },
    },
    '/api/**': {
      cors: true,
      headers: { 'cache-control': 's-maxage=60' },
    },
  },

  imports: {
    dirs: ['./lib', './composables'],
    autoImport: true,
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            charts: ['@unovis/vue', '@unovis/ts'],
            maps: ['leaflet', 'leaflet.markercluster'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['leaflet', 'leaflet.markercluster'],
    },
  },

  ssr: true,

  compatibilityDate: '2024-12-14',
})
