interface ViaCepResponse {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

export interface PostalCodeAddress {
  street: string
  neighborhood: string
  city: string
  complement: string
}

export const onlyPostalCodeDigits = (value: string) => value.replace(/\D/g, "").slice(0, 8)

export const formatPostalCode = (value: string) => {
  const digits = onlyPostalCodeDigits(value)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

export const lookupPostalCode = async (postalCode: string): Promise<PostalCodeAddress | null> => {
  const digits = onlyPostalCodeDigits(postalCode)

  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  const data = (await response.json()) as ViaCepResponse

  if (!response.ok || data.erro) return null

  return {
    street: data.logradouro || "",
    neighborhood: data.bairro || "",
    city: data.localidade || "",
    complement: data.complemento || "",
  }
}
