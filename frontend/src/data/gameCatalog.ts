import { Gamepad2, Rocket, Ticket, Trophy } from 'lucide-react'
import type { CatalogCategory, Product } from '../types/store'

export const gameCatalogRoute = '/semua-games'

export const preferredCatalogCategoryOrder = [
  'Top Up Games',
  'Joki Akun',
  'Akun Games',
  'Voucher & App',
] as const

export const slugifyText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getProductCategorySlug = (product: Pick<Product, 'category' | 'categorySlug'>) =>
  product.categorySlug ?? slugifyText(product.category)

export const buildCatalogCategories = (products: Product[]): CatalogCategory[] => {
  const categories = new Map<string, CatalogCategory>()

  products.forEach((product, index) => {
    const name = product.category
    const slug = getProductCategorySlug(product)
    const existing = categories.get(slug)
    const preferredIndex = preferredCatalogCategoryOrder.indexOf(name as (typeof preferredCatalogCategoryOrder)[number])

    if (existing) {
      existing.productCount += 1
      return
    }

    categories.set(slug, {
      id: slug,
      name,
      slug,
      sortOrder: preferredIndex >= 0 ? preferredIndex : 999 + index,
      productCount: 1,
    })
  })

  return Array.from(categories.values()).sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder
    return left.name.localeCompare(right.name)
  })
}

export const getCatalogProductsByCategory = (products: Product[], categorySlug?: string) => {
  if (!categorySlug || categorySlug === 'all') return products
  return products.filter((product) => getProductCategorySlug(product) === categorySlug)
}

export const countGameCatalogProducts = (products: Product[], categorySlug?: string) =>
  getCatalogProductsByCategory(products, categorySlug).length

export const getCatalogCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case 'Top Up Games':
      return Rocket
    case 'Joki Akun':
      return Trophy
    case 'Akun Games':
      return Gamepad2
    case 'Voucher & App':
      return Ticket
    default:
      return Gamepad2
  }
}

export const getCatalogCategoryBySlug = (categories: CatalogCategory[], categorySlug?: string) => {
  if (!categorySlug || categorySlug === 'all') return undefined
  return categories.find((category) => category.slug === categorySlug)
}
