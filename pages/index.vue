<script setup lang="ts">
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/app/AppHeader.vue'

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

function navigateToPointFrais() {
  navigateTo('/pointFrais')
}
</script>

<template>
  <div class="w-full flex flex-col">
    <AppHeader />
  </div>
</template>
