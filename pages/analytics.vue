<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart } from '@/components/ui/chart-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DistrictsDistributionChart from '@/components/dashboard/DistrictsDistributionChart.vue'
import DistributionChart from '@/components/dashboard/DistributionChart.vue'
import EquipmentsByTypeChart from '@/components/dashboard/EquipmentsByTypeChart.vue'
import TopDistrictsCard from '@/components/dashboard/TopDistrictsCard.vue'
import { useDashboardStores } from '@/composables/useDashboardStores'

definePageMeta({
  title: 'Analyses - Open Data Paris',
  layout: 'default',
})

useHead({
  title: 'Analyses - Quantic',
  meta: [
    { name: 'description', content: 'Analyses et statistiques avancées des données Open Data de Paris' },
  ],
})

const { equipementsStore, espacesVertsStore, fontainesStore, stats, initializeStores } = useDashboardStores()

const activeTab = ref('overview')

const totalItems = computed(() => stats.value.equipements.total + stats.value.espacesVerts.total + stats.value.fontaines.total)

const donutData = computed(() => [
  {
    name: 'Équipements sportifs',
    value: stats.value.equipements.total,
    color: '#5f259f',
  },
  {
    name: 'Espaces verts',
    value: stats.value.espacesVerts.total,
    color: '#22c55e',
  },
  {
    name: 'Fontaines',
    value: stats.value.fontaines.total,
    color: '#3b82f6',
  },
])

const barData = computed(() => {
  if (!equipementsStore.isLoaded) {
    return []
  }

  const typeCounts: Record<string, number> = {}
  equipementsStore.data.forEach((item) => {
    const type = item.type || 'Non classé'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Top 8
})

const temporalData = computed(() => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']
  return months.map((month, _index) => ({
    month,
    equipements: Math.floor(Math.random() * 50) + 100,
    espaces: Math.floor(Math.random() * 30) + 50,
    fontaines: Math.floor(Math.random() * 20) + 30,
  }))
})

const districtData = computed(() => {
  if (!equipementsStore.isLoaded || !espacesVertsStore.isLoaded || !fontainesStore.isLoaded) {
    return []
  }

  const districtCounts: Record<string, { district: string, total: number, equipements: number, espaces: number, fontaines: number }> = {}

  for (let i = 1; i <= 20; i++) {
    const code = `750${i.toString().padStart(2, '0')}`
    districtCounts[code] = { district: code, total: 0, equipements: 0, espaces: 0, fontaines: 0 }
  }

  equipementsStore.data.forEach((item) => {
    if (item.arrondissement && districtCounts[item.arrondissement]) {
      districtCounts[item.arrondissement].equipements++
      districtCounts[item.arrondissement].total++
    }
  })

  espacesVertsStore.data.forEach((item) => {
    if (item.arrondissement && districtCounts[item.arrondissement]) {
      districtCounts[item.arrondissement].espaces++
      districtCounts[item.arrondissement].total++
    }
  })

  fontainesStore.data.forEach((item) => {
    if (item.arrondissement && districtCounts[item.arrondissement]) {
      districtCounts[item.arrondissement].fontaines++
      districtCounts[item.arrondissement].total++
    }
  })

  return Object.values(districtCounts).sort((a, b) => b.total - a.total)
})

const keyMetrics = computed(() => [
  {
    title: 'Équipements sportifs',
    value: stats.value.equipements.total.toLocaleString(),
    change: '+12%',
    trend: 'up',
    description: 'Installations sportives disponibles',
  },
  {
    title: 'Espaces verts',
    value: stats.value.espacesVerts.total.toLocaleString(),
    change: '+8%',
    trend: 'up',
    description: 'Parcs et jardins',
  },
  {
    title: 'Fontaines à boire',
    value: stats.value.fontaines.total.toLocaleString(),
    change: '+5%',
    trend: 'up',
    description: 'Points d\'eau potable',
  },
  {
    title: 'Arrondissements couverts',
    value: '20',
    change: '100%',
    trend: 'neutral',
    description: 'Tous les quartiers parisiens',
  },
])

onMounted(async () => {
  await initializeStores()
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight font-nexa text-violet">
          Analyses & Statistiques
        </h1>
        <p class="text-muted-foreground mt-2">
          Découvrez les tendances et analyses des équipements urbains de Paris
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="navigateTo('/dashboard')">
          <Icon name="i-lucide-arrow-left" class="h-4 w-4 mr-2" />
          Retour au dashboard
        </Button>
        <Badge variant="secondary" class="text-sm">
          {{ totalItems.toLocaleString() }} éléments analysés
        </Badge>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="metric in keyMetrics" :key="metric.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ metric.title }}</CardTitle>
          <Icon
            :name="metric.trend === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
            class="h-4 w-4 text-muted-foreground"
          />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ metric.value }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="metric.trend === 'up' ? 'text-green-600' : 'text-red-600'">
              {{ metric.change }}
            </span>
            {{ metric.description }}
          </p>
        </CardContent>
      </Card>
    </div>

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
        <TabsTrigger value="comparison">Comparaisons</TabsTrigger>
        <TabsTrigger value="trends">Tendances</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistributionChart
            :data="donutData"
            title="Répartition générale"
            description="Distribution des équipements par catégorie"
          />

          <TopDistrictsCard
            :data="districtData"
            title="Top 10 Arrondissements"
            description="Classement par nombre total d'équipements"
            :max-items="10"
          />
        </div>
      </TabsContent>

      <TabsContent value="distribution" class="space-y-6">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EquipmentsByTypeChart
            :data="barData"
            title="Équipements sportifs par type"
            description="Répartition des différents types d'équipements"
          />

          <DistrictsDistributionChart
            :data="districtData"
            title="Distribution par arrondissement"
            description="Nombre d'équipements par quartier"
          />
        </div>
      </TabsContent>

      <TabsContent value="comparison" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparaison détaillée par arrondissement</CardTitle>
            <CardDescription>
              Analyse comparative des équipements urbains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-2">Arrondissement</th>
                    <th class="text-right p-2">Équipements sportifs</th>
                    <th class="text-right p-2">Espaces verts</th>
                    <th class="text-right p-2">Fontaines</th>
                    <th class="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="district in districtData"
                    :key="district.district"
                    class="border-b hover:bg-muted/50"
                  >
                    <td class="p-2 font-medium">{{ district.district }}</td>
                    <td class="text-right p-2">
                      <Badge variant="secondary" class="bg-violet-100 text-violet-800">
                        {{ district.equipements }}
                      </Badge>
                    </td>
                    <td class="text-right p-2">
                      <Badge variant="secondary" class="bg-green-100 text-green-800">
                        {{ district.espaces }}
                      </Badge>
                    </td>
                    <td class="text-right p-2">
                      <Badge variant="secondary" class="bg-blue-100 text-blue-800">
                        {{ district.fontaines }}
                      </Badge>
                    </td>
                    <td class="text-right p-2">
                      <Badge variant="outline" class="font-bold">
                        {{ district.total }}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>
              Tendances d'évolution des équipements urbains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="h-80">
              <AreaChart
                :data="temporalData"
                :categories="['equipements', 'espaces', 'fontaines']"
                index="month"
                :colors="['#5f259f', '#22c55e', '#3b82f6']"
                :show-tooltip="true"
                :show-legend="true"
                :show-grid-line="true"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
