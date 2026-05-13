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

