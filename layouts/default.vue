<script setup lang="ts">
import AppNavbar from '~/components/app/AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppNavbar />
    <main class="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
      <slot />
    </main>
  </div>
</template>

<style scoped>

</style>
