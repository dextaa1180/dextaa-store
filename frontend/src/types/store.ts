import type { LucideIcon } from 'lucide-react'

export type Product = {
  slug: string
  title: string
  publisher: string
  category: string
  categorySlug?: string
  price: string
  basePrice: number
  image: string
  badge: string
  accent: string
  description: string
  supports: string[]
  options?: ProductCatalogOption[]
}

export type ProductCatalogOption = {
  id?: string
  name: string
  serverName: string | null
  perk: string | null
  guestPrice: number
  memberPrice: number
  stock: number
  isActive: boolean
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  sortOrder: number
  productCount: number
}

export type ProductOption = {
  server: string
  name: string
  price: number
  stock: number
  perk: string
}

export type PaymentChannel = {
  logo: string
  name: string
}

export type PaymentGroup = {
  channels: PaymentChannel[]
  id: string
}

export type PriceRow = {
  memberPrice: number
  name: string
  status: 'Tersedia' | 'Habis'
  guestPrice: number
}

export type CustomerReview = {
  id: string
  invoice: string
  product: string
  rating: number
  message: string
  createdAt: string
}

export type NavItem = {
  href: string
  icon: LucideIcon
  label: string
}

export type RouteTarget = {
  path: string
  scrollToId?: string
}
