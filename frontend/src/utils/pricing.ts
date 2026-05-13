import type { PriceRow, Product, ProductOption } from '../types/store'

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

export const buildProductOptions = (product: Product): ProductOption[] => [
  ...(product.options?.length
    ? product.options
        .filter((option) => option.isActive)
        .map((option) => ({
          server: option.serverName ?? 'Server SEA',
          name: option.name,
          price: option.guestPrice,
          stock: option.stock,
          perk: option.perk ?? product.badge,
        }))
    : [
        {
          server: product.category === 'Joki Akun' ? 'Paket Rank' : 'Server SEA',
          name: `${product.title} Starter`,
          price: product.basePrice,
          stock: 8,
          perk: product.badge,
        },
        {
          server: product.category === 'Top Up Games' ? 'Paket Populer' : 'Server SEA',
          name: `${product.title} Plus Bundle`,
          price: product.basePrice * 3,
          stock: 5,
          perk: 'Paling dipilih',
        },
        {
          server: product.category === 'Joki Akun' ? 'Paket Rank' : 'Server Asia',
          name: `${product.title} Premium`,
          price: product.basePrice * 5,
          stock: 2,
          perk: 'Value tinggi',
        },
      ]),
]

export const buildPriceRows = (product: Product): PriceRow[] => {
  if (product.options?.length) {
    return product.options
      .filter((option) => option.isActive)
      .map((option) => ({
        memberPrice: option.memberPrice,
        name: option.name,
        status: option.stock > 0 ? 'Tersedia' : 'Habis',
        guestPrice: option.guestPrice,
      }))
  }

  const templates = [
    ['Starter Pack', 1, 'Tersedia'],
    ['Value Bundle', 2.1, 'Tersedia'],
    ['Monthly Classic', 3.4, 'Tersedia'],
    ['Premium Bundle', 5, 'Tersedia'],
    ['Growth Bundle', 7.2, 'Tersedia'],
    ['Large Pack', 10.8, 'Tersedia'],
    ['Mega Pack', 18, 'Tersedia'],
    ['Ultimate Pack', 31, product.category === 'Voucher & App' ? 'Habis' : 'Tersedia'],
  ] as const

  return templates.map(([label, multiplier, status]) => {
    const guestPrice = Math.round(product.basePrice * multiplier)
    return {
      memberPrice: Math.max(1000, guestPrice - Math.round(guestPrice * 0.025)),
      name: `${product.title} ${label}`,
      status,
      guestPrice,
    }
  })
}
