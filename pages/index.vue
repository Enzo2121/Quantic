<script setup lang="ts">
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'default',
  title: 'Accueil - Quantic',
})

useHead({
  title: 'Quantic - Exploration des données Open Data de Paris',
  meta: [
    { name: 'description', content: 'Explorez et analysez les données ouvertes de la ville de Paris avec notre interface moderne et intuitive.' },
  ],
})

function navigateToDashboard() {
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <Button
      size="lg"
      class="bg-[#5F259F] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-violet-900 hover:shadow-xl"
      @click="navigateToDashboard"
    >
      Accéder à l'application
    </Button>
  </div>
</template>
