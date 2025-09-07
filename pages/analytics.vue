<script setup lang="ts">
import DistributionChart from '@/components/dashboard/DistributionChart.vue'
import DistrictDonutChart from '@/components/dashboard/DistrictDonutChart.vue'
import EquipmentTypeDonutChart from '@/components/dashboard/EquipmentTypeDonutChart.vue'
import FontaineStatusDonutChart from '@/components/dashboard/FontaineStatusDonutChart.vue'
import HoraireDonutChart from '@/components/dashboard/HoraireDonutChart.vue'
import StackedComparisonChart from '@/components/dashboard/StackedComparisonChart.vue'
import TopDistrictsCard from '@/components/dashboard/TopDistrictsCard.vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart } from '@/components/ui/chart-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

const {
  isLoaded,
  error,
  stats,
  totalItems,
  donutData,
  barData,
  districtData,
  keyMetrics,
  horaireData,
  fontaineStatusData,
  refreshAllData,
  debugData,
} = useAnalyticsStore()

const activeTab = ref('overview')

function getColorsForCategory(category: string): string[] {
  if (category.includes('Équipements sportifs')) {
    return ['#22c55e', '#3b82f6', '#f59e0b', '#6b7280']
  }
  
  if (category.includes('Espaces verts')) {
    return ['#22c55e', '#f59e0b', '#10b981', '#ef4444']
  }
  
  if (category.includes('Fontaines par type')) {
    return ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
  }
  
  return ['#22c55e', '#3b82f6', '#f59e0b', '#6b7280', '#ef4444']
}
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-nexa text-3xl font-bold tracking-tight text-black">
          Analyses & Statistiques
        </h1>
        <p class="mt-2 text-muted-foreground">
          Découvrez les tendances et analyses des équipements urbains de Paris
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="navigateTo('/pointFrais')">
          <Icon name="i-lucide-arrow-left" class="mr-2 h-4 w-4" />
          Retour aux points frais
        </Button>
        <Badge variant="secondary" class="text-sm">
          {{ totalItems.toLocaleString() }} éléments analysés
        </Badge>
      </div>
    </div>

    <div v-if="error" class="flex h-64 items-center justify-center">
      <div class="text-center">
        <Icon name="i-lucide-alert-circle" class="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p class="text-red-500">
          {{ error }}
        </p>
        <Button class="mt-2" @click="refreshAllData">
          Réessayer
        </Button>
      </div>
    </div>

    <div v-else-if="isLoaded" class="space-y-8">
      <!-- Cartes de métriques -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card v-for="metric in keyMetrics" :key="metric.title">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              {{ metric.title }}
            </CardTitle>
            <Icon
              :name="metric.trend === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
              class="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ metric.value }}
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Onglets avec plus d'espacement -->
      <div class="mt-8">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="comparison">
              Comparaisons
            </TabsTrigger>
            <TabsTrigger value="distribution">
              Distribution
            </TabsTrigger>
          </TabsList>

          <!-- Contenu des onglets -->
          <TabsContent value="overview" class="space-y-8 mt-6">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DistributionChart
                :data="donutData"
                title="Répartition générale"
                description="Distribution des équipements par catégorie"
                :totals="{
                  equipements: stats.equipements.total,
                  espacesVerts: stats.espacesVerts.total,
                  fontaines: stats.fontaines.total,
                }"
              />

              <TopDistrictsCard
                :data="districtData"
                title="Top 10 Arrondissements"
                description="Classement par nombre total d'équipements"
                :max-items="10"
              />
            </div>
          </TabsContent>

          <TabsContent value="comparison" class="space-y-8 mt-6">
            <StackedComparisonChart
              :data="districtData"
              title="Comparaison par arrondissement"
              description="Équipements urbains par quartier - Top 10 arrondissements"
              :max-items="10"
            />

            <Card>
              <CardHeader>
                <CardTitle>Détails par arrondissement</CardTitle>
                <CardDescription>
                  Vue détaillée de tous les arrondissements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b">
                        <th class="p-2 text-left">
                          Arrondissement
                        </th>
                        <th class="p-2 text-right">
                          Équipements sportifs
                        </th>
                        <th class="p-2 text-right">
                          Espaces verts
                        </th>
                        <th class="p-2 text-right">
                          Fontaines
                        </th>
                        <th class="p-2 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="district in districtData"
                        :key="district.district"
                        class="border-b hover:bg-muted/50"
                      >
                        <td class="p-2 font-medium">
                          {{ district.displayName }}
                        </td>
                        <td class="p-2 text-right">
                          <Badge variant="secondary" class="bg-violet-100 text-violet-800">
                            {{ district.equipements }}
                          </Badge>
                        </td>
                        <td class="p-2 text-right">
                          <Badge variant="secondary" class="bg-green-100 text-green-800">
                            {{ district.espaces }}
                          </Badge>
                        </td>
                        <td class="p-2 text-right">
                          <Badge variant="secondary" class="bg-blue-100 text-blue-800">
                            {{ district.fontaines }}
                          </Badge>
                        </td>
                        <td class="p-2 text-right">
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

          <TabsContent value="distribution" class="space-y-8 mt-6">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <EquipmentTypeDonutChart
                :data="barData"
                title="Équipements par type"
                description="Répartition des différents types d'équipements sportifs"
              />

              <DistrictDonutChart
                :data="districtData"
                title="Distribution par arrondissement"
                description="Top 10 des arrondissements les mieux équipés"
                :max-items="10"
              />

              <FontaineStatusDonutChart
                :data="fontaineStatusData"
                title="État des fontaines"
                description="Répartition par statut de disponibilité"
                :colors="['#22c55e', '#ef4444', '#6b7280']"
              />
            </div>

            <div v-if="horaireData && horaireData.length > 0" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <HoraireDonutChart
                v-for="category in horaireData"
                :key="category.category"
                :title="category.category"
                :description="`Répartition des ${category.category.toLowerCase()}`"
                :data="category.data"
                :colors="getColorsForCategory(category.category)"
              />
            </div>

            <div v-else class="flex h-64 items-center justify-center">
              <div class="text-center">
                <Icon name="i-lucide-loader-2" class="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                <p class="text-sm text-muted-foreground">
                  Chargement des données d'horaires...
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
