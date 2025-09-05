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
    '~/assets/css/fonts.css',
    '~/assets/css/sidebar-exclusion.css',
    '~/assets/css/leaflet.css',
    '~/assets/css/quantic-colors.css',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'light', // Définir light comme mode par défaut
    fallback: 'light', // Mode de secours si la préférence n'est pas définie
  },

  features: {
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  experimental: {
    lazyHydration: true,
    payloadExtraction: true,
  },

  routeRules: {
    '/pointFrais': {
      ssr: true,
      headers: { 'cache-control': 's-maxage=60' },
    },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  compatibilityDate: '2024-12-14',
})
