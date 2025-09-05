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

  // Configuration des fonts optimisée
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Une seule font family au lieu de plusieurs
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

  // Optimisations de build
  nitro: {
    compressPublicAssets: true,
    minify: true,
  },

  experimental: {
    payloadExtraction: false, // Désactivé pour de meilleures performances
    inlineSSRStyles: false,
    viewTransition: true,
  },

  // Cache et optimisations des routes
  routeRules: {
    '/': { prerender: true },
    '/pointFrais': { 
      ssr: true, 
      headers: { 'cache-control': 's-maxage=300' } // Augmenté à 5 minutes
    },
    '/analytics': { 
      ssr: true,
      headers: { 'cache-control': 's-maxage=600' } // 10 minutes pour les analytics
    },
    '/api/**': { 
      cors: true,
      headers: { 'cache-control': 's-maxage=60' }
    },
  },

  // Optimisation des imports
  imports: {
    dirs: ['./lib', './composables'],
    // Optimisation: auto-import seulement ce qui est nécessaire
    autoImport: true,
  },

  // Configuration de build optimisée
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Séparation des chunks pour un meilleur cache
            'ui-components': ['@/components/ui'],
            'charts': ['@unovis/vue', '@unovis/ts'],
            'maps': ['leaflet', 'leaflet.markercluster'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['leaflet', 'leaflet.markercluster'],
    },
  },

  // Configuration SSR optimisée
  ssr: true,
  
  // Optimisation des images et assets
  image: {
    // Configuration future pour @nuxt/image si nécessaire
    quality: 80,
    format: ['webp', 'jpg', 'png'],
  },

  compatibilityDate: '2024-12-14',
})
