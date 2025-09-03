<script setup lang="ts">
// Import explicite du Header
import Header from '~/components/layout/Header.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    <main class="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
      <slot />
    </main>
  </div>
</template>

<style scoped>

</style>
