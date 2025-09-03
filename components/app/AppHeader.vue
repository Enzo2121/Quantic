<script setup lang="ts">
import { Button } from '@/components/ui/button'
import AppCard from './AppCard.vue'

// Reactive state
const searchQuery = ref('')

// Methods
function handleSearch() {
  if (searchQuery.value.trim()) {
    // Scroll to dashboard and trigger search
    const dashboardElement = document.querySelector('#dashboard-content')
    if (dashboardElement) {
      dashboardElement.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

function scrollToDashboard() {
  const dashboardElement = document.querySelector('#dashboard-content')
  if (dashboardElement) {
    dashboardElement.scrollIntoView({ behavior: 'smooth' })
  }
}

// Expose methods for parent component
defineExpose({
  handleSearch,
  scrollToDashboard,
})
</script>

<template>
  <div class="w-full">
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" />

      <div class="relative px-4 lg:px-6 py-16 lg:py-24">

        <div class="space-y-8">

          <h1 class="font-medium leading-tight font-nexa text-2xl md:text-4xl lg:text-6xl text-gray-900">
            SOS Paris <span class="bg-[#5F259F] text-white px-2 py-1 rounded">surchauffe</span> . Trouvez une zone fraîcheur en quelques clics
          </h1>


          <p class="max-w-4xl font-normal leading-relaxed text-gray-400 text-xl">
            Découvrez les équipements sportifs, espaces verts et fontaines à boire de Paris.
            Restez au frais cet été grâce aux données Open Data.
          </p>


          <div class="max-w-2xl space-y-6">

            <div class="group relative">
              <div class="rounded-lg border border-black/10 bg-[#FAFAFA] px-4 py-3 shadow-sm transition-colors hover:bg-gray-50">
                <div class="flex items-center gap-4">

                  <div class="flex-shrink-0">
                    <Icon
                      name="i-lucide-search"
                      class="h-6 w-6 text-gray-600"
                    />
                  </div>


                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Rechercher un équipement, un parc, une fontaine..."
                    class="flex-1 border-0 bg-transparent text-base font-medium outline-none placeholder:text-gray-400"
                    @keyup.enter="handleSearch"
                  />
                </div>
              </div>
            </div>

          </div>


          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 pt-8 w-full px-2 lg:px-0">
            <AppCard
              title="Ilots de fraîcheur"
              description="Les îlots de fraîcheur sont des sources de rafraîchissement par rapport à leur environnement proche en période chaude ou caniculaire."
              :icon="['tree-pine', 'leaf', 'droplets']"
              variant="froid"
            />
            <AppCard
              title="Espaces verts"
              description="Les îlots de fraîcheur sont des sources de rafraîchissement par rapport à leur environnement proche en période chaude ou caniculaire."
              :icon="['leaf', 'tree-pine', 'flower']"
              variant="nature"
            />
            <AppCard
              title="Fontaines à boire"
              description="Les îlots de fraîcheur sont des sources de rafraîchissement par rapport à leur environnement proche en période chaude ou caniculaire."
              :icon="['droplets', 'glass-water', 'bottle']"
              variant="eau"
            />
          </div>
        </div>
      </div>


      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" class="h-12 w-full fill-white">
          <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </div>
  </div>
</template>
