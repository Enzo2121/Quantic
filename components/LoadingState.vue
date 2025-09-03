<script setup lang="ts">
interface Props {
  loading: boolean
  type?: 'spinner' | 'skeleton' | 'table'
  rows?: number
  columns?: number
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  rows: 5,
  columns: 4,
  text: 'Chargement...'
})
</script>

<template>
  <div v-if="loading" class="w-full">
    <div v-if="type === 'spinner'" class="flex flex-col items-center justify-center py-12 space-y-4">
      <Icon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">{{ text }}</p>
    </div>

    <div v-else-if="type === 'skeleton'" class="space-y-4">
      <div v-for="i in rows" :key="i" class="flex space-x-4">
        <div v-for="j in columns" :key="j" class="flex-1">
          <div class="h-4 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'table'" class="space-y-4">
      <div class="rounded-md border">
        <div class="p-4">
          <div class="flex space-x-4 mb-4">
            <div v-for="j in columns" :key="j" class="flex-1">
              <div class="h-4 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div v-for="i in rows" :key="i" class="flex space-x-4 mb-2">
            <div v-for="j in columns" :key="j" class="flex-1">
              <div class="h-4 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <slot v-else />
</template>
