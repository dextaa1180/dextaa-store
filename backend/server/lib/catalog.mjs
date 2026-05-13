const formatPrice = (value) =>
  `Rp ${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value)}`

const resolveProductPrice = (product) => {
  const activeOptions = product.options.filter((option) => option.isActive)
  if (!activeOptions.length) return 0
  return Math.min(...activeOptions.map((option) => option.guestPrice))
}

export const serializePublicProduct = (product) => {
  const priceFrom = resolveProductPrice(product)

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    publisher: product.publisher,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: priceFrom > 0 ? `Mulai ${formatPrice(priceFrom)}` : 'Harga belum tersedia',
    basePrice: priceFrom,
    image: product.coverImageUrl ?? product.media[0]?.mediaUrl ?? '',
    badge: product.badge ?? '',
    accent: product.accentColor ?? '#2563eb',
    description: product.description ?? product.shortDescription ?? '',
    supports: product.supports.map((support) => support.label),
    options: product.options.map((option) => ({
      id: option.id,
      name: option.name,
      serverName: option.serverName,
      perk: option.perk,
      guestPrice: option.guestPrice,
      memberPrice: option.memberPrice,
      stock: option.stock,
      isActive: option.isActive,
    })),
  }
}

export const catalogProductInclude = {
  category: true,
  media: {
    orderBy: [{ sortOrder: 'asc' }],
  },
  supports: {
    orderBy: [{ sortOrder: 'asc' }],
  },
  options: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
}

