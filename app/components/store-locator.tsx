"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { MapPin, Search, AlertTriangle, CheckCircle, MessageCircle } from "lucide-react"
import { geocodeAddressPrecise } from "@/lib/address-geocoding"
import { formatPostalCode, lookupPostalCode, onlyPostalCodeDigits } from "@/lib/postal-code"
import InteractiveMap from "./interactive-map"

interface Unit {
  id: string
  name: string
  address: string
  neighborhood: string
  city: string
  state: string
  coordinates: { lat: number; lon: number }
  color: string
  whatsapp: string
  kmlName?: string
}

interface SearchAddress {
  postalCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
}

interface StoreResult {
  store: Unit | null
  distance: number | null
  isInCoverage: boolean
  coordinates: { lat: number; lon: number }
}

interface KMLPolygon {
  name: string
  coordinates: Array<{ lat: number; lon: number }>
}

// Unidades com cores para o mapa e nomes correspondentes no KML
const units: Unit[] = [
  {
    id: "botafogo",
    name: "Botafogo",
    address: "Rua Ipu 12",
    neighborhood: "Botafogo",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -22.9504, lon: -43.1868 },
    color: "#E11D48",
    whatsapp: "5521971802956",
    kmlName: "GURUME BOTAFOGO",
  },
  {
    id: "rdb",
    name: "RDB",
    address: "Avenida das Américas 7777",
    neighborhood: "Barra da Tijuca",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -23.0002, lon: -43.3602 },
    color: "#0F766E",
    whatsapp: "5521997741055",
    kmlName: "GURUME RDB",
  },
  {
    id: "ipanema",
    name: "Ipanema",
    address: "Rua Aníbal de Mendonça 132",
    neighborhood: "Ipanema",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -22.9848, lon: -43.2038 },
    color: "#2563EB",
    whatsapp: "5521997089865",
    kmlName: "GURUME IPANEMA",
  },
  {
    id: "rdl",
    name: "RDL",
    address: "Avenida Ataulfo de Paiva 270",
    neighborhood: "Leblon",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -22.9841, lon: -43.2235 },
    color: "#F97316",
    whatsapp: "552139003063",
    kmlName: "GURUME RDL",
  },
  {
    id: "icarai",
    name: "Icaraí",
    address: "Rua Nóbrega 198",
    neighborhood: "Icaraí",
    city: "Niterói",
    state: "RJ",
    coordinates: { lat: -22.9097, lon: -43.1057 },
    color: "#7C3AED",
    whatsapp: "552136137175",
    kmlName: "GURUME ICARAI",
  },
  {
    id: "tijuca",
    name: "Tijuca",
    address: "Avenida Maracanã 987",
    neighborhood: "Tijuca",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -22.9266, lon: -43.2359 },
    color: "#16A34A",
    whatsapp: "5521997949667",
    kmlName: "GURUME TIJUCA",
  },
  {
    id: "fashion-mall",
    name: "Fashion Mall",
    address: "Estrada da Gávea 899",
    neighborhood: "São Conrado",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -22.9964, lon: -43.249 },
    color: "#DB2777",
    whatsapp: "5521986691888",
    kmlName: "GURUME FMALL",
  },
  {
    id: "rio-sul",
    name: "Rio Sul",
    address: "Rua Lauro Muller 116",
    neighborhood: "Botafogo",
    city: "Rio de Janeiro",
    state: "RJ",
    coordinates: { lat: -22.9493, lon: -43.1781 },
    color: "#FACC15",
    whatsapp: "552139005132",
    kmlName: "GURUME RIO SUL",
  },
  {
    id: "bsb",
    name: "BSB",
    address: "SMAS Trecho 1",
    neighborhood: "Zona Industrial",
    city: "Brasília",
    state: "DF",
    coordinates: { lat: -15.808, lon: -47.9494 },
    color: "#0891B2",
    whatsapp: "556135504055",
    kmlName: "GURUME BSB PARK",
  },
  {
    id: "sp",
    name: "SP",
    address: "Rua Natingui, 1536",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    coordinates: { lat: -23.5677, lon: -46.702 },
    color: "#A16207",
    whatsapp: "551150436103",
    kmlName: "GURUME VILA MADALENA JUL25",
  },
]

export default function StoreLocator() {
  const [selectedUnit, setSelectedUnit] = useState<string>("all")
  const [searchAddress, setSearchAddress] = useState<SearchAddress>({
    postalCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
  })
  const [result, setResult] = useState<StoreResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [polygons, setPolygons] = useState<KMLPolygon[]>([])
  const [usePostalCode, setUsePostalCode] = useState(true)
  const [postalCodeLoading, setPostalCodeLoading] = useState(false)
  const [postalCodeFeedback, setPostalCodeFeedback] = useState("")

  // Parse KML data on component mount
  useEffect(() => {
    const loadKML = async () => {
      try {
        const response = await fetch("/coverage-areas.kml")
        const kmlText = await response.text()
        const parsedPolygons = parseKMLData(kmlText)
        setPolygons(parsedPolygons)
        console.log("KML carregado com sucesso:", parsedPolygons.length, "polígonos")
      } catch (error) {
        console.error("Erro ao carregar KML:", error)
      }
    }

    loadKML()
  }, [])

  const parseKMLData = (kmlText: string): KMLPolygon[] => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(kmlText, "text/xml")
      const placemarks = xmlDoc.getElementsByTagName("Placemark")
      const parsedPolygons: KMLPolygon[] = []

      for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i]
        const nameElement = placemark.getElementsByTagName("name")[0]
        const coordinatesElements = Array.from(placemark.getElementsByTagName("coordinates"))

        if (nameElement && coordinatesElements.length > 0) {
          const name = nameElement.textContent || ""

          coordinatesElements.forEach((coordinatesElement) => {
            const coordinatesText = coordinatesElement.textContent || ""

            const coordinates = coordinatesText
              .trim()
              .split(/\s+/)
              .map((coord) => {
                const [lon, lat] = coord.split(",").map(Number)
                return { lat, lon }
              })
              .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lon))

            if (coordinates.length > 0) {
              parsedPolygons.push({ name, coordinates })
            }
          })
        }
      }

      return parsedPolygons
    } catch (error) {
      console.error("Erro ao fazer parse do KML:", error)
      return []
    }
  }

  // Function to check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = (point: { lat: number; lon: number }, polygon: { lat: number; lon: number }[]): boolean => {
    let inside = false
    const x = point.lon
    const y = point.lat

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lon
      const yi = polygon[i].lat
      const xj = polygon[j].lon
      const yj = polygon[j].lat

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }

    return inside
  }

  // Function to find which store serves a location
  const findServingStore = (coords: { lat: number; lon: number }): Unit | null => {
    for (const unit of units) {
      if (unit.kmlName) {
        const unitPolygons = polygons.filter((p) => p.name === unit.kmlName)
        if (unitPolygons.some((polygon) => isPointInPolygon(coords, polygon.coordinates))) {
          return unit
        }
      }
    }
    return null
  }

  // Função para calcular distância
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Função para encontrar a loja responsável
  const findResponsibleStore = async () => {
    if (usePostalCode && onlyPostalCodeDigits(searchAddress.postalCode).length !== 8) {
      setError("Informe um CEP válido ou use a opção iniciar sem CEP")
      return
    }

    if (!searchAddress.street || !searchAddress.number || !searchAddress.neighborhood || !searchAddress.city) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)
    setError("")

    try {
      const coords = await geocodeAddressPrecise(searchAddress)

      if (!coords) {
        setError("Endereço não encontrado. Verifique se os dados estão corretos.")
        setLoading(false)
        return
      }

      // First, check if the address is within any coverage area
      const servingStore = findServingStore(coords)

      if (servingStore) {
        const distance = calculateDistance(
          coords.lat,
          coords.lon,
          servingStore.coordinates.lat,
          servingStore.coordinates.lon,
        )
        setResult({
          store: servingStore,
          distance,
          isInCoverage: true,
          coordinates: coords,
        })
        setSelectedUnit(servingStore.id)
      } else {
        setResult({
          store: null,
          distance: null,
          isInCoverage: false,
          coordinates: coords,
        })
        setSelectedUnit("all")
      }
    } catch (error) {
      setError("Erro ao buscar a loja. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddressChange = (field: keyof SearchAddress, value: string) => {
    setSearchAddress((prev) => ({ ...prev, [field]: value }))
    setResult(null)
    setError("")
  }

  const handlePostalCodeChange = async (value: string) => {
    const formattedPostalCode = formatPostalCode(value)
    const digits = onlyPostalCodeDigits(formattedPostalCode)

    setSearchAddress((prev) => ({ ...prev, postalCode: formattedPostalCode }))
    setResult(null)
    setError("")
    setPostalCodeFeedback("")

    if (digits.length !== 8) return

    setPostalCodeLoading(true)
    try {
      const address = await lookupPostalCode(digits)

      if (!address) {
        setPostalCodeFeedback("CEP não encontrado. Complete o endereço manualmente.")
        return
      }

      setSearchAddress((prev) => ({
        ...prev,
        postalCode: formattedPostalCode,
        street: address.street || prev.street,
        neighborhood: address.neighborhood || prev.neighborhood,
        city: address.city || prev.city,
        complement: prev.complement || address.complement,
      }))
      setPostalCodeFeedback("Endereço preenchido pelo CEP. Complete os dados que faltarem.")
    } catch (error) {
      setPostalCodeFeedback("Não foi possível consultar o CEP agora. Complete o endereço manualmente.")
    } finally {
      setPostalCodeLoading(false)
    }
  }

  const handlePostalCodeModeChange = (enabled: boolean) => {
    setUsePostalCode(enabled)
    setPostalCodeFeedback("")
    setError("")
    setResult(null)
  }

  const hasValidPostalCode = !usePostalCode || onlyPostalCodeDigits(searchAddress.postalCode).length === 8
  const canEditAddress = hasValidPostalCode
  const isFormValid =
    hasValidPostalCode && searchAddress.street && searchAddress.number && searchAddress.neighborhood && searchAddress.city

  // Prepare search result for map
  const mapSearchResult = result
    ? {
        coordinates: result.coordinates,
        store: result.store ? { id: result.store.id, name: result.store.name } : null,
        isInCoverage: result.isInCoverage,
      }
    : null

  // Count units with polygon data
  const unitsWithPolygons = units.filter((unit) => unit.kmlName && polygons.some((p) => p.name === unit.kmlName)).length

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Formulário de Busca */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40 px-5 py-5 sm:px-6 lg:px-8">
          <CardTitle className="flex items-center gap-2 font-serif text-2xl font-normal text-foreground">
            <Search strokeWidth={1.5} className="h-5 w-5 text-primary" />
            Identificar Loja Responsável
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Informe o endereço para descobrir qual loja atende a região.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-5 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Endereço para consulta</Label>

            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label htmlFor="search-postal-code">CEP {usePostalCode ? "*" : ""}</Label>
                  <Input
                    id="search-postal-code"
                    value={searchAddress.postalCode}
                    onChange={(e) => handlePostalCodeChange(e.target.value)}
                    placeholder="00000-000"
                    inputMode="numeric"
                    disabled={!usePostalCode}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePostalCodeModeChange(!usePostalCode)}
                  className="md:w-44"
                >
                  {usePostalCode ? "Iniciar sem CEP" : "Usar CEP"}
                </Button>
              </div>
              {(postalCodeLoading || postalCodeFeedback) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {postalCodeLoading ? "Consultando CEP..." : postalCodeFeedback}
                </p>
              )}
            </div>

            {canEditAddress ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
                  <div className="md:col-span-8">
                    <Label htmlFor="search-street">Rua *</Label>
                    <Input
                      id="search-street"
                      value={searchAddress.street}
                      onChange={(e) => handleAddressChange("street", e.target.value)}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor="search-number">Número *</Label>
                    <Input
                      id="search-number"
                      value={searchAddress.number}
                      onChange={(e) => handleAddressChange("number", e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="search-complement">Complemento</Label>
                  <Input
                    id="search-complement"
                    value={searchAddress.complement}
                    onChange={(e) => handleAddressChange("complement", e.target.value)}
                    placeholder="Apartamento, bloco, etc. (opcional)"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <div>
                    <Label htmlFor="search-neighborhood">Bairro *</Label>
                    <Input
                      id="search-neighborhood"
                      value={searchAddress.neighborhood}
                      onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="search-city">Cidade *</Label>
                    <Input
                      id="search-city"
                      value={searchAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                Digite o CEP para liberar os campos de endereço ou clique em iniciar sem CEP.
              </div>
            )}
          </div>

          <Button onClick={findResponsibleStore} disabled={!isFormValid || loading} className="w-full" size="lg">
            <Search strokeWidth={1.5} className="h-4 w-4 mr-2" />
            {loading ? "Buscando loja..." : "Identificar Loja"}
          </Button>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle strokeWidth={1.5} className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultado */}
          {result && (
            <Card
              className={
                result.isInCoverage
                  ? "border-primary/20 bg-primary/5"
                  : "border-accent/40 bg-accent/10"
              }
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 font-serif text-xl font-normal ${
                    result.isInCoverage ? "text-primary" : "text-accent-foreground"
                  }`}
                >
                  {result.isInCoverage ? (
                    <CheckCircle strokeWidth={1.5} className="h-5 w-5" />
                  ) : (
                    <AlertTriangle strokeWidth={1.5} className="h-5 w-5" />
                  )}
                  {result.isInCoverage ? "Loja que Atende" : "Endereço não atendido"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.store ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Loja</span>
                        <span className="font-serif text-lg text-foreground">{result.store.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground">Endereço</span>
                        <span className="text-right text-sm text-foreground">
                          {result.store.address}, {result.store.neighborhood}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Distância</span>
                        <span className="font-mono text-sm font-medium text-foreground">
                          {result.distance?.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="font-mono text-xs uppercase tracking-wider text-primary">
                          Dentro da cobertura
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 rounded-md border border-accent/30 bg-background p-3 text-xs text-foreground">
                      <AlertTriangle strokeWidth={1.5} className="mr-1 inline h-3 w-3 text-accent" />
                      Este endereço não é atendido no momento por nenhuma unidade cadastrada.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Mapa e Filtros */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40 px-5 py-5 sm:px-6 lg:px-8">
          <CardTitle className="flex items-center gap-2 font-serif text-2xl font-normal text-foreground">
            <MapPin strokeWidth={1.5} className="h-5 w-5 text-primary" />
            Áreas de Cobertura
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Visualize as áreas de atendimento de cada unidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* Filtro de Unidade */}
          <div className="relative z-10 space-y-2">
            <Label htmlFor="unit-filter">Filtrar por unidade</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="relative z-10">
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent className="relative z-50">
                <SelectItem value="all">Todas as unidades</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          {/* Mapa Interativo */}
          <div className="relative">
            <InteractiveMap
              polygons={polygons}
              units={units}
              selectedUnit={selectedUnit}
              searchResult={mapSearchResult}
            />
          </div>

          {/* Estatísticas */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Total de unidades
              </p>
              <p className="mt-1 font-serif text-3xl text-foreground">{units.length}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70">
                Áreas mapeadas
              </p>
              <p className="mt-1 font-serif text-3xl text-primary">{unitsWithPolygons}</p>
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-foreground">Legenda das Unidades</Label>
            <div className="grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto rounded-md border border-border bg-muted/30 p-2 text-xs">
              {units
                .filter((unit) => selectedUnit === "all" || unit.id === selectedUnit)
                .map((unit) => {
                  const hasPolygon = unit.kmlName && polygons.some((p) => p.name === unit.kmlName)
                  return (
                    <div
                      key={unit.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-background"
                    >
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: unit.color }}
                      />
                      <span className="font-medium text-foreground">{unit.name}</span>
                      <span className="text-muted-foreground">({unit.city})</span>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider ${
                          hasPolygon ? "text-primary" : "text-accent"
                        }`}
                      >
                        {hasPolygon ? "mapeada" : "sem dados"}
                      </span>
                      <a
                        href={`https://wa.me/${unit.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir WhatsApp da unidade ${unit.name}`}
                        title={`WhatsApp ${unit.name}`}
                        className="ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-[hsl(var(--whatsapp)/0.35)] bg-[hsl(var(--whatsapp)/0.12)] text-[hsl(var(--whatsapp))] transition-colors hover:bg-[hsl(var(--whatsapp)/0.22)]"
                      >
                        <MessageCircle strokeWidth={1.75} className="h-4 w-4" />
                      </a>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Aviso sobre dados */}
          {unitsWithPolygons < units.length && (
            <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3">
              <div className="flex items-start gap-2 text-xs text-foreground">
                <AlertTriangle strokeWidth={1.5} className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                <div>
                  <strong className="font-semibold">Aviso:</strong> Apenas {unitsWithPolygons} de {units.length} unidades
                  possuem dados de área de cobertura. Unidades sem dados KML não exibirão áreas no mapa.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
