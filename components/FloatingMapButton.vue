<script setup lang="ts">
interface Props {
  visible?: boolean
  itemCount?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  itemCount: 0,
  loading: false,
})

const emit = defineEmits<{
  'open-map': []
}>()

function handleClick() {
  if (!props.loading) {
    emit('open-map')
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-16 opacity-0 scale-90"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-16 opacity-0 scale-90"
  >
    <div
      v-if="visible"
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <Button
        @click="handleClick"
        :disabled="loading"
        size="lg"
        class="floating-map-button h-14 px-6 bg-quantic hover:bg-quantic/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 rounded-full font-medium"
      >
        <Icon
          :name="loading ? 'i-lucide-loader-2' : 'i-lucide-map'"
          :class="['h-5 w-5', { 'animate-spin': loading }]"
        />
        <span class="hidden sm:inline">Ouvrir la carte</span>
        <span class="sm:hidden">Carte</span>
        
        <Badge
          v-if="itemCount > 0 && !loading"
          variant="secondary"
          class="ml-1 bg-white/20 text-white border-white/30"
        >
          {{ itemCount }}
        </Badge>
      </Button>
    </div>
  </Transition>
</template>


