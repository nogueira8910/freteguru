export interface AddressInput {
  street: string
  number: string
  neighborhood: string
  city: string
}

interface KnownLocation {
  aliases: string[]
  lat: number
  lon: number
}

interface NominatimResult {
  lat: string
  lon: string
  display_name?: string
  importance?: number
  place_rank?: number
  addresstype?: string
  address?: {
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    municipality?: string
    state?: string
    postcode?: string
    country_code?: string
  }
}

const knownLocations: KnownLocation[] = [
  {
    aliases: ["rua ipu 12 botafogo rio de janeiro"],
    lat: -22.9554915,
    lon: -43.1928953,
  },
  {
    aliases: ["avenida das americas 7777 barra da tijuca rio de janeiro"],
    lat: -23.0013736,
    lon: -43.3858868,
  },
  {
    aliases: [
      "rua anibal de mendonca 132 ipanema rio de janeiro",
      "rua anibal mendonca 132 ipanema rio de janeiro",
      "anibal de mendonca 132 ipanema",
      "anibal mendonca 132 ipanema",
    ],
    lat: -22.9830484,
    lon: -43.2111676,
  },
  {
    aliases: ["avenida ataulfo de paiva 270 leblon rio de janeiro"],
    lat: -22.9833242,
    lon: -43.2185146,
  },
  {
    aliases: ["rua nobrega 198 icarai niteroi"],
    lat: -22.9039618,
    lon: -43.1028635,
  },
  {
    aliases: ["avenida maracana 987 tijuca rio de janeiro"],
    lat: -22.9219661,
    lon: -43.2352278,
  },
  {
    aliases: ["estrada da gavea 899 sao conrado rio de janeiro"],
    lat: -22.9966097,
    lon: -43.2600252,
  },
  {
    aliases: ["rua lauro muller 116 botafogo rio de janeiro"],
    lat: -22.9571479,
    lon: -43.1767367,
  },
  {
    aliases: ["smas trecho 1 zona industrial brasilia"],
    lat: -15.8340757,
    lon: -47.9552193,
  },
  {
    aliases: ["rua natingui 1536 pinheiros sao paulo"],
    lat: -23.5595637,
    lon: -46.6991795,
  },
  {
    aliases: ["rua engenheiro neves da rocha 538 itanhanga rio de janeiro"],
    lat: -22.996131,
    lon: -43.299325,
  },
  {
    aliases: [
      "rua figueiredo magalhaes 263 copacabana rio de janeiro",
      "rua figueiredo de magalhaes 263 copacabana rio de janeiro",
      "figueiredo magalhaes 263 copacabana",
      "figueiredo de magalhaes 263 copacabana",
    ],
    lat: -22.969877,
    lon: -43.186438,
  },
]

export const normalizeAddressText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\b(r|r\.)\b/g, "rua")
    .replace(/\s+/g, " ")
    .trim()

const buildFullAddress = (address: AddressInput) =>
  `${address.street} ${address.number}, ${address.neighborhood}, ${address.city}, Brasil`

const findKnownLocation = (address: AddressInput) => {
  const normalizedAddress = normalizeAddressText(buildFullAddress(address))

  return knownLocations.find((location) =>
    location.aliases.some((alias) => normalizedAddress.includes(normalizeAddressText(alias))),
  )
}

const scoreGeocodingResult = (result: NominatimResult, address: AddressInput): number => {
  const resultAddress = result.address || {}
  const resultText = normalizeAddressText(
    [
      result.display_name,
      resultAddress.house_number,
      resultAddress.road,
      resultAddress.neighbourhood,
      resultAddress.suburb,
      resultAddress.city,
      resultAddress.town,
      resultAddress.municipality,
      resultAddress.state,
      resultAddress.postcode,
    ]
      .filter(Boolean)
      .join(" "),
  )
  const street = normalizeAddressText(address.street)
  const neighborhood = normalizeAddressText(address.neighborhood)
  const city = normalizeAddressText(address.city)
  const number = normalizeAddressText(address.number)

  let score = 0

  if (resultAddress.country_code === "br") score += 12
  if (street && resultText.includes(street)) score += 35
  if (street.includes("figueiredo magalhaes") && resultText.includes("figueiredo de magalhaes")) score += 35
  if (city && resultText.includes(city)) score += 20
  if (neighborhood && resultText.includes(neighborhood)) score += 18
  if (number && normalizeAddressText(resultAddress.house_number || "") === number) score += 80
  if (result.addresstype === "house" || result.addresstype === "building") score += 25
  if (result.addresstype === "road") score -= 8
  if (typeof result.importance === "number") score += result.importance

  return score
}

const pickBestGeocodingResult = (results: NominatimResult[], address: AddressInput): NominatimResult | null => {
  if (!results.length) return null

  return [...results].sort(
    (first, second) => scoreGeocodingResult(second, address) - scoreGeocodingResult(first, address),
  )[0]
}

export const geocodeAddressPrecise = async (address: AddressInput): Promise<{ lat: number; lon: number } | null> => {
  const knownLocation = findKnownLocation(address)

  if (knownLocation) {
    return { lat: knownLocation.lat, lon: knownLocation.lon }
  }

  try {
    const searchParams = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "8",
      countrycodes: "br",
      street: `${address.number} ${address.street}`,
      city: address.city,
    })

    if (normalizeAddressText(address.city).includes("rio de janeiro")) {
      searchParams.set("viewbox", "-43.795,-22.746,-43.099,-23.083")
    }

    const structuredResponse = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams.toString()}`, {
      headers: { "Accept-Language": "pt-BR" },
    })
    const structuredData = (await structuredResponse.json()) as NominatimResult[]
    const structuredBest = pickBestGeocodingResult(structuredData, address)

    if (structuredBest) {
      return {
        lat: Number.parseFloat(structuredBest.lat),
        lon: Number.parseFloat(structuredBest.lon),
      }
    }

    const fallbackParams = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "8",
      countrycodes: "br",
      q: buildFullAddress(address),
    })
    const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?${fallbackParams.toString()}`, {
      headers: { "Accept-Language": "pt-BR" },
    })
    const fallbackData = (await fallbackResponse.json()) as NominatimResult[]
    const fallbackBest = pickBestGeocodingResult(fallbackData, address)

    if (fallbackBest) {
      return {
        lat: Number.parseFloat(fallbackBest.lat),
        lon: Number.parseFloat(fallbackBest.lon),
      }
    }

    return null
  } catch (error) {
    console.error("Erro de geocoding:", error)
    return null
  }
}
