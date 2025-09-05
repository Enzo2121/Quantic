<script setup lang="ts">
import DarkToggle from '@/components/DarkToggle.vue'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

const navItems = [
  { name: 'Accueil', href: '/', icon: 'i-lucide-home' },
  { name: 'Trouver un point frais', href: '/pointFrais', icon: 'i-lucide-map-pin' },
  { name: 'Analyse des données', href: '/analytics', icon: 'i-lucide-bar-chart-3' },
]

const route = useRoute()

const showMobileMenu = ref(false)

function isActiveRoute(href: string) {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="px-4 lg:px-6">
      <div class="max-w-[1430px] mx-auto flex h-16 items-center">
        <div class="flex items-center gap-2 flex-shrink-0">
          <h1 class="font-nexa text-xl font-bold text-[#5F259F]">
            Quantic Factory
          </h1>
        </div>

        <NavigationMenu class="hidden md:flex ml-auto">
          <NavigationMenuList class="flex gap-1">
            <NavigationMenuItem v-for="item in navItems" :key="item.name">
              <NavigationMenuLink
                as-child
              >
                <NuxtLink
                  :to="item.href"
                  class="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  :class="isActiveRoute(item.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'"
                >
                  <Icon :name="item.icon" class="mr-2 h-4 w-4" />
                  {{ item.name }}
                </NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

          <div class="flex items-center gap-2 ml-4">
          <DarkToggle />

          <Button
            as-child
            variant="default"
            size="default"
            class="bg-[#5F259F] hover:bg-[#5F259F]/90 text-white px-6 py-2 hidden lg:flex"
          >
            <NuxtLink to="/analytics" class="flex items-center gap-2">
              <Icon name="i-lucide-github" class="h-4 w-4" />
              <span class="hidden sm:inline">Repo Github</span>
            </NuxtLink>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            class="md:hidden"
            @click="toggleMobileMenu"
          >
            <Icon name="i-lucide-menu" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <div
      v-if="showMobileMenu"
      class="border-t bg-background md:hidden"
    >
      <div class="px-4 lg:px-6 py-4">
        <div class="max-w-4xl mx-auto">
          <nav class="flex flex-col gap-2">
            <NuxtLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.href"
              class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              :class="isActiveRoute(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'"
              @click="closeMobileMenu"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
              {{ item.name }}
            </NuxtLink>

            <!-- Bouton Dark/Light Mode pour mobile -->
            <div class="flex items-center justify-between px-3 py-2">
              <span class="text-sm font-medium text-muted-foreground">Thème</span>
              <DarkToggle />
            </div>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>
