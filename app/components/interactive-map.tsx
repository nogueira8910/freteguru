"use client"

import { useEffect, useRef, useState } from "react"

interface MapProps {
  polygons: Array<{
    name: string
    coordinates: Array<{ lat: number; lon: number }>
  }>
  units: Array<{
    id: string
    name: string
    coordinates: { lat: number; lon: number }
    color: string
    kmlName?: string
    address: string
    neighborhood: string
    city: string
  }>
  selectedUnit: string
  searchResult?: {
    coordinates: { lat: number; lon: number }
    store: {
      id: string
      name: string
    } | null
    isInCoverage: boolean
  } | null
}

declare global {
  interface Window {
    L: any
  }
}

const normalizeKMLName = (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase()

export default function InteractiveMap({ polygons, units, selectedUnit, searchResult }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Load Leaflet JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          setIsLoaded(true)
        }
        document.head.appendChild(script)
      } else if (window.L) {
        setIsLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on Brazil
    const map = window.L.map(mapRef.current).setView([-22.9068, -43.1729], 10)

    // Add tile layer
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      detectRetina: true,
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLoaded])

  // Function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Update map content when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const map = mapInstanceRef.current

    // Clear existing layers
    map.eachLayer((layer: any) => {
      if (layer.options && (layer.options.isPolygon || layer.options.isMarker)) {
        map.removeLayer(layer)
      }
    })

    const bounds = window.L.latLngBounds()
    let hasContent = false

    console.log(
      "Available polygons:",
      polygons.map((p) => p.name),
    )
    console.log("Selected unit:", selectedUnit)

    // Add polygons ONLY if they exist in KML data
    polygons.forEach((polygon) => {
      const unit = units.find((u) => normalizeKMLName(u.kmlName || "") === normalizeKMLName(polygon.name))
      if (!unit) {
        console.log(`No unit found for polygon: ${polygon.name}`)
        return
      }

      // Filter by selected unit
      if (selectedUnit !== "all" && unit.id !== selectedUnit) return

      const coordinates = polygon.coordinates.map((coord) => [coord.lat, coord.lon])
      const isSelected = selectedUnit !== "all" && unit.id === selectedUnit

      console.log(`Rendering polygon for ${unit.name} with ${coordinates.length} points`)

      // Google Maps-like styling for real KML data
      const polygonStyle = isSelected
        ? {
            // Selected unit - prominent Google Maps style
            color: unit.color, // Solid border color
            fillColor: unit.color, // Fill color
            fillOpacity: 0.32, // Semi-transparent fill
            weight: 7, // Bold border
            opacity: 1, // Solid border
            isPolygon: true,
          }
        : {
            // Non-selected units - subtle style
            color: unit.color,
            fillColor: unit.color,
            fillOpacity: 0.16,
            weight: 5,
            opacity: 0.95,
            isPolygon: true,
          }

      const polygonLayer = window.L.polygon(coordinates, polygonStyle).addTo(map)

      // Enhanced popup for selected unit
      const popupContent = isSelected
        ? `
          <div class="p-3 min-w-52">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-4 h-4 rounded" style="background-color: ${unit.color}; border: 2px solid white; box-shadow: 0 0 0 1px ${unit.color};"></div>
              <h3 class="font-bold text-lg text-gray-800">${unit.name}</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-start gap-2">
                <span class="text-gray-500 min-w-16">📍 Endereço:</span>
                <span class="text-gray-700">${unit.address}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-gray-500 min-w-16">🏘️ Bairro:</span>
                <span class="text-gray-700">${unit.neighborhood}, ${unit.city}</span>
              </div>
            </div>
            <div class="mt-3 p-2 rounded" style="background-color: ${hexToRgba(unit.color, 0.1)}; border-left: 3px solid ${unit.color};">
              <div class="text-xs font-medium" style="color: ${unit.color};">
                🎯 ÁREA DE COBERTURA REAL
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Área baseada em dados KML precisos que seguem ruas e bairros
              </div>
            </div>
          </div>
        `
        : `
          <div class="p-2">
            <h3 class="font-bold text-sm">${unit.name}</h3>
            <p class="text-xs text-gray-600">${unit.address}</p>
            <p class="text-xs text-gray-600">${unit.neighborhood}, ${unit.city}</p>
            <p class="text-xs text-green-600 mt-1">✓ Área de cobertura mapeada</p>
          </div>
        `

      polygonLayer.bindPopup(popupContent)

      // Add to bounds
      coordinates.forEach(([lat, lon]) => {
        bounds.extend([lat, lon])
        hasContent = true
      })
    })

    // Add unit markers
    units.forEach((unit) => {
      if (selectedUnit !== "all" && unit.id !== selectedUnit) return

      const isSelected = selectedUnit !== "all" && unit.id === selectedUnit
      const hasPolygon =
        unit.kmlName && polygons.some((p) => normalizeKMLName(p.name) === normalizeKMLName(unit.kmlName || ""))

      // Enhanced marker styling for selected unit
      const markerStyle = isSelected
        ? {
            color: "#ffffff", // White border
            fillColor: unit.color,
            fillOpacity: 1,
            radius: 12,
            weight: 3,
            isMarker: true,
          }
        : {
            color: "#ffffff",
            fillColor: unit.color,
            fillOpacity: hasPolygon ? 0.9 : 0.5,
            radius: hasPolygon ? 8 : 6,
            weight: 2,
            isMarker: true,
          }

      const marker = window.L.circleMarker([unit.coordinates.lat, unit.coordinates.lon], markerStyle).addTo(map)

      // Enhanced popup for selected unit marker
      const markerPopupContent = isSelected
        ? `
          <div class="p-3 min-w-48">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${unit.color}"></div>
              <h3 class="font-bold text-base text-gray-800">${unit.name}</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-gray-500">🏪</span>
                <span class="text-gray-700 font-medium">Localização da Loja</span>
              </div>
              <div class="text-gray-600 ml-6">
                ${unit.address}<br>
                ${unit.neighborhood}, ${unit.city}
              </div>
            </div>
            <div class="mt-3 p-2 ${hasPolygon ? "bg-green-50 border-l-3 border-green-400" : "bg-orange-50 border-l-3 border-orange-400"}">
              <div class="text-xs font-medium ${hasPolygon ? "text-green-700" : "text-orange-700"}">
                ${hasPolygon ? "✅ UNIDADE COM ÁREA MAPEADA" : "⚠️ UNIDADE SEM DADOS DE ÁREA"}
              </div>
              <div class="text-xs ${hasPolygon ? "text-green-600" : "text-orange-600"} mt-1">
                ${hasPolygon ? "Área de cobertura disponível no mapa" : "Dados KML necessários para exibir área"}
              </div>
            </div>
          </div>
        `
        : `
          <div class="p-2">
            <h3 class="font-bold text-sm">${unit.name}</h3>
            <p class="text-xs text-gray-600">${unit.address}</p>
            <p class="text-xs text-gray-600">${unit.neighborhood}, ${unit.city}</p>
            ${
              hasPolygon
                ? '<p class="text-xs text-green-600 mt-1">✓ Área mapeada</p>'
                : '<p class="text-xs text-orange-600 mt-1">⚠ Sem dados de área</p>'
            }
          </div>
        `

      marker.bindPopup(markerPopupContent)

      bounds.extend([unit.coordinates.lat, unit.coordinates.lon])
      hasContent = true
    })

    // Add search result marker if exists
    if (searchResult) {
      const searchIcon = window.L.divIcon({
        className: "custom-search-marker",
        html: `
          <div style="
            background-color: #ef4444;
            border: 3px solid white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background-color: white;
              border-radius: 50%;
              width: 8px;
              height: 8px;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const searchMarker = window.L.marker([searchResult.coordinates.lat, searchResult.coordinates.lon], {
        icon: searchIcon,
        isMarker: true,
      }).addTo(map)

      searchMarker.bindPopup(`
        <div class="p-3 min-w-48">
          <h3 class="font-bold text-base text-gray-800 mb-2">📍 Endereço Pesquisado</h3>
          <div class="space-y-2">
            <div class="p-2 rounded ${searchResult.isInCoverage ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}">
              <div class="text-sm font-medium ${searchResult.isInCoverage ? "text-green-700" : "text-orange-700"}">
                ${searchResult.isInCoverage ? "✅ DENTRO DA ÁREA DE COBERTURA" : "⚠️ FORA DA ÁREA DE COBERTURA"}
              </div>
              <div class="text-xs ${searchResult.isInCoverage ? "text-green-600" : "text-orange-600"} mt-1">
                ${
                  searchResult.store
                    ? `Loja responsável: ${searchResult.store.name}`
                    : "Endereço não atendido no momento"
                }
              </div>
            </div>
          </div>
        </div>
      `)

      bounds.extend([searchResult.coordinates.lat, searchResult.coordinates.lon])
      hasContent = true

      // If search result, focus on it
      map.setView([searchResult.coordinates.lat, searchResult.coordinates.lon], 14)
      return
    }

    // Fit bounds if we have content
    if (hasContent && bounds.isValid()) {
      // For selected unit, zoom closer to show the coverage area clearly
      if (selectedUnit !== "all") {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
      } else {
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    } else {
      // Default view for Brazil
      map.setView([-15.7801, -47.9292], 4)
    }
  }, [polygons, units, selectedUnit, searchResult, isLoaded])

  if (!isLoaded) {
    return (
      <div className="relative z-0 flex h-[clamp(24rem,45vh,34rem)] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="font-medium text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={mapRef}
          className="relative z-0 h-[clamp(24rem,45vh,34rem)] w-full rounded-lg border border-border shadow-sm"
        />
      </div>

      <div className="text-center text-xs text-muted-foreground">
        {selectedUnit !== "all"
          ? "Áreas coloridas mostram regiões de cobertura baseadas em dados KML reais"
          : "Selecione uma unidade para visualizar sua área de cobertura (se disponível)"}
      </div>
    </div>
  )
}
