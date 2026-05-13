import type { CatalogCategory, Product } from '../types/store'

type CatalogPayload = {
  categories: CatalogCategory[]
  products: Product[]
}

export const fetchCatalog = async (): Promise<CatalogPayload> => {
  const response = await fetch('/api/catalog', { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to load catalog')
  return response.json()
}

export const searchCatalogProducts = async (query: string): Promise<Product[]> => {
  const params = new URLSearchParams({ q: query })
  const response = await fetch(`/api/catalog/products?${params.toString()}`, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to search catalog')
  const payload = (await response.json()) as { products: Product[] }
  return payload.products
}
