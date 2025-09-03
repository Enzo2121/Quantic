<script setup lang="ts">
import type { EquipementSportifItem, EspaceVertItem, FontaineItem } from '~/types/datasets'

interface Props {
  items: (EquipementSportifItem | EspaceVertItem | FontaineItem)[]
  height?: string
  zoom?: number
  center?: [number, number]
  showClusters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '500px',
  zoom: 12, 
  center: () => [48.8566, 2.3522], 
  showClusters: true
})

// Template refs
const mapContainer = ref<HTMLDivElement>()
const mapInstance = ref<any>(null) 
const markers = ref<any[]>([])
const popups = ref<any[]>([])

let L: any = null
const isClient = import.meta.client || typeof window !== 'undefined'

onMounted(async () => {
  if (!isClient) return

  await nextTick()
  initializeMap()
})

onUnmounted(() => {
  if (!isClient || !mapInstance.value) return

  try {
    mapInstance.value.off()

    markers.value.forEach(marker => {
      if (marker && mapInstance.value && mapInstance.value.hasLayer(marker)) {
        mapInstance.value.removeLayer(marker)
      }
    })

    markers.value = []
    popups.value = []

    mapInstance.value.eachLayer((layer) => {
      if (layer !== mapInstance.value.getPane('tilePane')) {
        mapInstance.value?.removeLayer(layer)
      }
    })

    mapInstance.value.remove()
  } catch (error) {
    console.error('Erreur lors du nettoyage de la carte:', error)
  }

  mapInstance.value = null
})

watch(() => props.items, (newItems) => {
  if (isClient) {
    updateMarkers(newItems)
  }
}, { deep: true })

watch(() => props.center, (newCenter) => {
  if (isClient && newCenter && mapInstance.value) {
    mapInstance.value.setView(newCenter, props.zoom)
  }
}, { immediate: false })

watch(() => props.zoom, (newZoom) => {
  if (isClient && newZoom && mapInstance.value) {
    mapInstance.value.setZoom(newZoom)
  }
})

async function initializeMap() {
  if (!isClient || !mapContainer.value) {
    console.warn('Client non détecté ou conteneur de carte non trouvé')
    return
  }

  if (mapInstance.value) {
    console.warn('Carte déjà initialisée, skipping')
    return
  }

  try {
    L = await import('leaflet')

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })

    console.log('Initialisation de la carte avec:', {
      center: props.center,
      zoom: props.zoom,
      container: mapContainer.value
    })

    mapInstance.value = L.map(mapContainer.value, {
      center: props.center,
      zoom: props.zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      fadeAnimation: true,
      zoomAnimation: true,
      preferCanvas: true 
    })

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANNSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // Transparent fallback
    })

    tileLayer.on('tileerror', (e) => {
      console.warn('Erreur chargement tuile:', e)
    })

    tileLayer.addTo(mapInstance.value)

    mapInstance.value.on('zoomend', handleZoomChange)
    mapInstance.value.on('moveend', handleMoveChange)
    mapInstance.value.on('resize', handleResize)

    if (props.items.length > 0) {
      updateMarkers(props.items)
    }

    setTimeout(() => {
      mapInstance.value?.invalidateSize()
    }, 100)

    console.log('Carte initialisée avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la carte:', error)
  }
}

function handleResize() {
  console.log('📏 Carte redimensionnée')
  setTimeout(() => {
    mapInstance.value?.invalidateSize()
  }, 50)
}

function handleZoomChange() {
  if (!mapInstance.value) return

  const currentZoom = mapInstance.value.getZoom()
  const currentCenter = mapInstance.value.getCenter()

  console.log('Zoom changé:', currentZoom, 'Centre:', [currentCenter.lat, currentCenter.lng])

  optimizeMarkersForZoom(currentZoom)

  setTimeout(() => {
    mapInstance.value?.invalidateSize()

    setTimeout(() => {
      refreshMarkersIfNeeded()
    }, 100)
  }, 200)
}

function optimizeMarkersForZoom(zoom: number) {
  if (!mapInstance.value) return

  try {
    const container = mapInstance.value.getContainer()

    if (zoom <= 10) {
      container.style.setProperty('--marker-opacity', '0.6')
      console.log('Zoom faible détecté - optimisation activée')
    } else if (zoom >= 15) {
      container.style.setProperty('--marker-opacity', '1')
      console.log('Zoom élevé détecté - qualité maximale')
    } else {
      container.style.setProperty('--marker-opacity', '0.8')
    }
  } catch (error) {
    console.warn('Erreur lors de l\'optimisation des marqueurs:', error)
  }
}

function handleMoveChange() {
  if (!mapInstance.value) return

  const currentCenter = mapInstance.value.getCenter()
  console.log('Centre changé:', [currentCenter.lat, currentCenter.lng])
}

function refreshMarkersIfNeeded() {
  if (!mapInstance.value || markers.value.length === 0) return

  try {
    const mapBounds = mapInstance.value.getBounds()
    let markersInBounds = 0
    let markersWithValidPosition = 0

    markers.value.forEach(marker => {
      try {
        const markerLatLng = marker.getLatLng()
        if (markerLatLng && typeof markerLatLng.lat === 'number' && typeof markerLatLng.lng === 'number') {
          markersWithValidPosition++
          if (mapBounds.contains(markerLatLng)) {
            markersInBounds++
          }
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification d\'un marqueur:', error)
      }
    })

    console.log(`Marqueurs valides: ${markersWithValidPosition}/${markers.value.length}`)
    console.log(`Marqueurs dans les bounds: ${markersInBounds}/${markersWithValidPosition}`)

    const visibilityRatio = markersWithValidPosition > 0 ? markersInBounds / markersWithValidPosition : 0

    if (visibilityRatio < 0.1 && markers.value.length > 0) {
      console.warn('Peu de marqueurs visibles, forçage du rafraîchissement')
      forceRefreshMarkers()
    } else if (markersWithValidPosition < markers.value.length * 0.8) {
      console.warn('Plusieurs marqueurs invalides détectés')
      forceRefreshMarkers()
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des marqueurs:', error)
    forceRefreshMarkers()
  }
}

function forceRefreshMarkers() {
  if (!mapInstance.value) return

  console.log('Forçage du rafraîchissement des marqueurs')

  const currentItems = props.items

  markers.value.forEach(marker => {
    if (marker && mapInstance.value) {
      mapInstance.value.removeLayer(marker)
    }
  })
  markers.value = []
  popups.value = []

  if (currentItems.length > 0) {
    nextTick(() => {
      updateMarkers(currentItems)
    })
  }
}

function diagnoseMarkerIssues() {
  if (!mapInstance.value) {
    console.warn('Aucune instance de carte')
    return
  }

  const mapBounds = mapInstance.value.getBounds()
  const mapCenter = mapInstance.value.getCenter()
  const mapZoom = mapInstance.value.getZoom()

  console.group('Diagnostic des marqueurs')
  console.log('État de la carte:')
  console.log('  - Centre:', [mapCenter.lat, mapCenter.lng])
  console.log('  - Zoom:', mapZoom)
  console.log('  - Bounds:', mapBounds.toBBoxString())
  console.log('  - Nombre de marqueurs:', markers.value.length)

  console.log('Analyse des marqueurs:')
  markers.value.forEach((marker, index) => {
    const pos = marker.getLatLng()
    const inBounds = mapBounds.contains(pos)
    console.log(`  ${index + 1}. Position: [${pos.lat}, ${pos.lng}] - Dans bounds: ${inBounds}`)
  })

  console.log('État des calques:')
  mapInstance.value.eachLayer((layer) => {
    console.log('  - Layer:', layer.constructor.name)
  })

  console.groupEnd()
}

defineExpose({
  flyToLocation,
  invalidateSize,
  forceRefreshMarkers,
  diagnoseMarkerIssues
})

async function updateMarkers(items: (EquipementSportifItem | EspaceVertItem | FontaineItem)[]) {
  if (!isClient || !mapInstance.value) return

  console.log('Mise à jour des marqueurs:', items.length, 'éléments')

  markers.value.forEach(marker => {
    if (marker && mapInstance.value && mapInstance.value.hasLayer(marker)) {
      mapInstance.value.removeLayer(marker)
    }
  })
  markers.value = []
  popups.value = []

  const validItems = items.filter(item => {
    const coords = getValidCoordinates(item)
    return coords !== null
  })

  console.log(`Items avec coordonnées valides: ${validItems.length}/${items.length}`)

  for (const item of validItems) {
    const coords = getValidCoordinates(item)
    if (coords) {
      try {
        await createMarker({ ...item, latitude: coords.lat, longitude: coords.lng })
      } catch (error) {
        console.error('Erreur création marqueur:', error, item)
      }
    }
  }

  if (markers.value.length > 0 && L) {
    try {
      const bounds = L.latLngBounds(markers.value.map(m => m.getLatLng()))
      mapInstance.value.fitBounds(bounds.pad(0.1))

      setTimeout(() => {
        mapInstance.value?.invalidateSize()
      }, 300)
    } catch (error) {
      console.error('Erreur lors du calcul des bounds:', error)
      setTimeout(() => {
        mapInstance.value?.invalidateSize()
      }, 300)
    }
  }

  console.log('Marqueurs mis à jour:', markers.value.length)
}

function getValidCoordinates(item: EquipementSportifItem | EspaceVertItem | FontaineItem): { lat: number; lng: number } | null {
  let lat: number | null = null
  let lng: number | null = null

  try {
    if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
      lat = item.latitude
      lng = item.longitude
    } else if ('geometry' in item && item.geometry?.coordinates && Array.isArray(item.geometry.coordinates) && item.geometry.coordinates.length >= 2) {
      const rawLng = item.geometry.coordinates[0]
      const rawLat = item.geometry.coordinates[1]

      if (typeof rawLng === 'number' && typeof rawLat === 'number') {
        lng = rawLng
        lat = rawLat
      }
    }

    if (lat !== null && lng !== null &&
        !Number.isNaN(lat) && !Number.isNaN(lng) &&
        Number.isFinite(lat) && Number.isFinite(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180) {

      // Uncomment if you want to filter only Paris area
      // const isInParisArea = lat >= 48.8 && lat <= 48.9 && lng >= 2.2 && lng <= 2.5
      // if (!isInParisArea) {
      //   console.warn('Coordonnées hors de Paris:', [lat, lng])
      //   return null
      // }

      return { lat, lng }
    }
  } catch (error) {
    console.error('Erreur lors de la validation des coordonnées:', error, item)
  }

  return null
}

async function createMarker(item: EquipementSportifItem | EspaceVertItem | FontaineItem) {
  if (!isClient || !mapInstance.value || !L) return

  try {
    const icon = await getItemIcon(item)
    const popupContent = createPopupContent(item)

    const marker = L.marker([item.latitude!, item.longitude!], {
      icon: L.divIcon(icon),
      riseOnHover: true,
      riseOffset: 250
    })

    const popup = L.popup({
      closeButton: true,
      autoClose: true,
      closeOnEscapeKey: true,
      className: 'custom-popup',
      maxWidth: 320,
      minWidth: 280,
      keepInView: true
    }).setContent(popupContent)

    marker.bindPopup(popup)

    marker.on('popupopen', () => {
      console.log('Popup ouvert pour:', item.nom || item.adresse)
    })

    marker.on('popupclose', () => {
      console.log('Popup fermé')
    })

    marker.addTo(mapInstance.value)

    if (mapInstance.value.hasLayer(marker)) {
      markers.value.push(marker)
      console.log('Marqueur ajouté:', item.nom || item.adresse)
    } else {
      console.warn('Échec ajout marqueur:', item.nom || item.adresse)
    }

  } catch (error) {
    console.error('Erreur création marqueur:', error, item)
  }
}

async function getItemIcon(item: EquipementSportifItem | EspaceVertItem | FontaineItem) {
  try {
    let color = '#5f259f'

    if ('type' in item && typeof item.type === 'string') {
      const typeLower = item.type.toLowerCase()

      if (typeLower.includes('sport') || typeLower.includes('gymnase') || typeLower.includes('terrain')) {
        color = '#ef4444'
      } else if (typeLower.includes('parc') || typeLower.includes('jardin') || typeLower.includes('espace vert')) {
        color = '#22c55e'
      } else if (typeLower.includes('fontaine') || typeLower.includes('eau')) {
        color = '#3b82f6'
      }
    }
    
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      color = '#5f259f'
    }

    return {
      html: `
        <div class="custom-marker-container">
          <div class="custom-marker-pulse" style="background-color: ${color};"></div>
          <div class="custom-marker-core" style="background-color: ${color};">
            <div class="custom-marker-inner"></div>
          </div>
        </div>
      `,
      className: 'custom-marker-wrapper',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    }
  } catch (error) {
    console.error('Erreur création icône:', error, item)
    return {
      html: `
        <div class="custom-marker-container">
          <div class="custom-marker-pulse" style="background-color: #5f259f;"></div>
          <div class="custom-marker-core" style="background-color: #5f259f;">
            <div class="custom-marker-inner"></div>
          </div>
        </div>
      `,
      className: 'custom-marker-wrapper',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    }
  }
}

function createPopupContent(item: EquipementSportifItem | EspaceVertItem | FontaineItem) {
  const title = 'nom' in item ? item.nom : 'Sans nom'
  const type = 'type' in item ? item.type : 'Équipement'
  const arrondissement = item.arrondissement
  const address = 'adresse' in item ? item.adresse : 'Adresse non disponible'
  const lat = item.latitude
  const lng = item.longitude

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return `
    <div class="map-popup-container">
      <div class="map-popup-card">
        <div class="map-popup-header">
          <h3 class="map-popup-title">${escapeHtml(title || 'Sans nom')}</h3>
          <div class="map-popup-badge">${escapeHtml(type)}</div>
        </div>

        <div class="map-popup-content">
          <div class="map-popup-info">
            <div class="map-popup-info-item">
              <svg class="map-popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="map-popup-text">${escapeHtml(arrondissement)}</span>
            </div>

            <div class="map-popup-info-item">
              <svg class="map-popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="map-popup-text">${escapeHtml(address || 'Adresse non disponible')}</span>
            </div>

            ${'superficie' in item && item.superficie ? `
              <div class="map-popup-info-item">
                <svg class="map-popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span class="map-popup-text">${item.superficie} m²</span>
              </div>
            ` : ''}

            ${'etat' in item ? `
              <div class="map-popup-info-item">
                <svg class="map-popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="map-popup-text ${item.etat === 'OUI' ? 'text-green-600' : 'text-red-600'}">
                  ${item.etat === 'OUI' ? 'Disponible' : item.etat === 'NON' ? 'Indisponible' : item.etat}
                </span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="map-popup-footer">
          <button class="map-popup-button-primary" onclick="window.open('${googleMapsUrl}', '_blank')">
            <svg class="map-popup-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Itinéraire
          </button>
        </div>
      </div>
    </div>
  `
}

function flyToLocation(lat: number, lng: number) {
  if (isClient && mapInstance.value) {
    console.log(`Animation vers [${lat}, ${lng}] avec zoom 16`)
    mapInstance.value.flyTo([lat, lng], 16)
  } else {
    console.warn('Impossible de centrer : carte non initialisée')
  }
}

function invalidateSize() {
  if (isClient && mapInstance.value) {
    setTimeout(() => {
      mapInstance.value?.invalidateSize()
    }, 100)
  }
}

</script>

<template>
  <div class="w-full">
    <div
      v-if="isClient"
      ref="mapContainer"
      :style="{ height: height }"
      class="rounded-lg border overflow-hidden dashboard-map"
      @transitionend="invalidateSize"
    />
    <div
      v-else
      :style="{ height: height }"
      class="rounded-lg border overflow-hidden dashboard-map flex items-center justify-center bg-muted"
    >
      <div class="text-center space-y-2">
        <Icon name="i-lucide-map" class="h-8 w-8 text-muted-foreground mx-auto" />
        <p class="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="flex gap-2 mt-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        @click="invalidateSize"
      >
        <Icon name="i-lucide-refresh" class="w-4 h-4 mr-2" />
        Redimensionner
      </Button>

      <Button
        variant="outline"
        size="sm"
        @click="mapInstance?.setView([48.8566, 2.3522], 11)"
      >
        <Icon name="i-lucide-home" class="w-4 h-4 mr-2" />
        Paris centre
      </Button>

      <Button
        variant="outline"
        size="sm"
        @click="forceRefreshMarkers"
      >
        <Icon name="i-lucide-rotate-cw" class="w-4 h-4 mr-2" />
        Rafraîchir marqueurs
      </Button>

      <Button
        variant="outline"
        size="sm"
        @click="diagnoseMarkerIssues"
      >
        <Icon name="i-lucide-search" class="w-4 h-4 mr-2" />
        Diagnostiquer
      </Button>

      <div v-if="isClient" class="text-xs text-muted-foreground flex items-center gap-4 ml-auto">
        <span>Zoom: {{ mapInstance?.getZoom() }}</span>
        <span>Marqueurs: {{ markers.length }}</span>
        <span v-if="mapInstance">Centre: {{ mapInstance.getCenter().lat.toFixed(4) }}, {{ mapInstance.getCenter().lng.toFixed(4) }}</span>
      </div>
    </div>
  </div>
</template>
