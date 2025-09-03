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
  },

  features: {
    // For UnoCSS
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  // ✅ OPTIMISATIONS LAZY LOADING selon doc officielle
  experimental: {
    // Active les stratégies d'hydratation intelligentes
    lazyHydration: true,
    // Optimise le payload pour les composants lazy
    payloadExtraction: true,
  },

  routeRules: {
    // Dashboard avec cache intelligent
    '/dashboard': { 
      ssr: true,
      headers: { 'cache-control': 's-maxage=60' }
    },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  compatibilityDate: '2024-12-14',
})
