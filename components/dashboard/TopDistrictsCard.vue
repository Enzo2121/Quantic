<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DistrictItem {
  district: string
  total: number
  equipements: number
  espaces: number
  fontaines: number
}

interface Props {
  data: DistrictItem[]
  title?: string
  description?: string
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Top 10 Arrondissements',
  description: 'Classement par nombre total d\'équipements',
  maxItems: 10,
})

const topDistricts = computed(() =>
  props.data.slice(0, props.maxItems)
)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <div
          v-for="(district, index) in topDistricts"
          :key="district.district"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
              {{ index + 1 }}
            </Badge>
            <span class="font-medium">{{ district.district }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{{ district.total }}</span>
            <div class="flex gap-1">
              <div
                class="w-2 h-2 rounded-full bg-violet-500"
                :title="`Équipements: ${district.equipements}`"
              ></div>
              <div
                class="w-2 h-2 rounded-full bg-green-500"
                :title="`Espaces: ${district.espaces}`"
              ></div>
              <div
                class="w-2 h-2 rounded-full bg-blue-500"
                :title="`Fontaines: ${district.fontaines}`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
