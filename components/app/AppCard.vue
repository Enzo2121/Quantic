<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="group w-full">
    <div class="rounded-lg border border-border bg-card p-3 lg:p-5 min-h-40 transition-all duration-200 hover:shadow-md hover:-translate-y-1 w-full min-w-0 flex flex-col overflow-hidden">
      <div class="flex items-center gap-3 mb-3 flex-shrink-0">
        <div class="flex gap-2">
          <Icon
            :name="`i-lucide-${icon[0]}`"
            class="transition-colors duration-200 flex-shrink-0 h-6 w-6 text-[#5F259F]"
          />
        </div>
      </div>

      <div class="flex-1 flex flex-col space-y-2 overflow-hidden">
        <h3 class="font-medium font-nexa text-xl lg:text-2xl text-card-foreground leading-tight line-clamp-2 flex-shrink-0">
          {{ title }}
        </h3>

        <p class="font-normal font-nexa text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-3 flex-1 overflow-hidden">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-geist {
  font-family:
    'Geist',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}
</style>
