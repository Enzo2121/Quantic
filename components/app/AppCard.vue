<template>
  <div class="group w-full">
    <div class="rounded-lg border border-black/10 bg-[#FAFAFA] p-3 lg:p-5 min-h-40 transition-all duration-200 hover:shadow-md hover:-translate-y-1 w-full min-w-0 flex flex-col overflow-hidden">
      <div class="flex items-center gap-3 mb-3 flex-shrink-0">
        <div class="flex gap-2">
          <Icon
            v-for="(iconName, index) in icon"
            :key="iconName"
            :name="`i-lucide-${iconName}`"
            :class="[
              'transition-colors duration-200 flex-shrink-0',
              getIconClasses(index)
            ]"
          />
        </div>
      </div>

      <div class="flex-1 flex flex-col space-y-2 overflow-hidden">
        <h3 class="font-medium font-geist text-xl lg:text-2xl text-black leading-tight line-clamp-2 flex-shrink-0">
          {{ title }}
        </h3>

        <p class="font-normal font-geist text-sm lg:text-base text-black leading-relaxed line-clamp-3 flex-1 overflow-hidden">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string[]
  variant: 'froid' | 'nature' | 'eau'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'froid'
})

function getIconClasses(index: number): string {
  const baseClasses = 'h-6 w-6'

  switch (props.variant) {
    case 'froid':
      if (index === 0) return `${baseClasses} text-[#5F259F]` 
      return `${baseClasses} text-white`

    case 'nature':
      if (index === 0) return `${baseClasses} text-[#5F259F]` 
      return `${baseClasses} text-white`

    case 'eau':
      if (index === 0) return `${baseClasses} text-[#5F259F]` 
      return `${baseClasses} text-white`

    default:
      return `${baseClasses} text-[#5F259F]`
  }
}
</script>

<style scoped>
.font-geist {
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
