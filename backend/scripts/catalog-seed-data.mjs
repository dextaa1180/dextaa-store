export const catalogSeedCategories = [
  { name: 'Top Up Games', sortOrder: 1 },
  { name: 'Joki Akun', sortOrder: 2 },
  { name: 'Akun Games', sortOrder: 3 },
  { name: 'Voucher & App', sortOrder: 4 },
]

export const catalogSeedProducts = [
  {
    title: 'Mobile Legends Diamond',
    publisher: 'Moonton',
    categoryName: 'Top Up Games',
    badge: 'Instan',
    accentColor: '#1d4ed8',
    coverImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=720&q=80',
    description:
      'Top up diamond Mobile Legends dengan alur cepat, pilihan nominal rapi, dan status pesanan yang mudah dipantau.',
    shortDescription: 'Top up diamond Mobile Legends cepat dan rapi.',
    basePrice: 1500,
    supportLabels: ['ID Server', 'Proses otomatis', 'Promo nominal'],
  },
  {
    title: 'Genshin Genesis Crystal',
    publisher: 'Hoyoverse',
    categoryName: 'Top Up Games',
    badge: 'Promo',
    accentColor: '#0891b2',
    coverImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=720&q=80',
    description: 'Isi Genesis Crystal untuk kebutuhan gacha, blessing, dan bundle dengan detail order yang sederhana.',
    shortDescription: 'Isi Genesis Crystal untuk kebutuhan gacha.',
    basePrice: 14000,
    supportLabels: ['UID game', 'Server global', 'Checkout singkat'],
  },
  {
    title: 'Wuthering Reroll Starter',
    publisher: 'Kuro Game',
    categoryName: 'Akun Games',
    badge: 'Stok Baru',
    accentColor: '#7c3aed',
    coverImageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=720&q=80',
    description:
      'Pilihan akun starter dan reroll untuk Wuthering Waves dengan stok, spek akun, dan garansi yang jelas.',
    shortDescription: 'Starter dan reroll siap pakai.',
    basePrice: 35000,
    supportLabels: ['Akun starter', 'Cek stok', 'Garansi login'],
  },
  {
    title: 'Honkai Star Rail Express',
    publisher: 'Hoyoverse',
    categoryName: 'Akun Games',
    badge: 'Aman',
    accentColor: '#2563eb',
    coverImageUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=720&q=80',
    description: 'Akun Honkai Star Rail siap pilih dengan catatan karakter, progres, dan instruksi pengamanan.',
    shortDescription: 'Akun Honkai Star Rail siap pilih.',
    basePrice: 49000,
    supportLabels: ['Detail akun', 'Panduan aman', 'Stok terbatas'],
  },
  {
    title: 'Joki Rank MLBB',
    publisher: 'Pilot Pro',
    categoryName: 'Joki Akun',
    badge: 'Fast Slot',
    accentColor: '#ea580c',
    coverImageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=720&q=80',
    description: 'Layanan joki rank Mobile Legends dengan pilihan paket, estimasi pengerjaan, dan catatan request.',
    shortDescription: 'Joki rank MLBB dengan slot cepat.',
    basePrice: 25000,
    supportLabels: ['Pilih tier', 'Slot cepat', 'Progress update'],
  },
  {
    title: 'Weekly Pass & Voucher',
    publisher: 'Multi Platform',
    categoryName: 'Voucher & App',
    badge: 'Lengkap',
    accentColor: '#0f766e',
    coverImageUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=720&q=80',
    description: 'Voucher dan weekly pass lintas platform dalam satu tempat, cocok untuk pembelian rutin.',
    shortDescription: 'Voucher dan weekly pass lintas platform.',
    basePrice: 9000,
    supportLabels: ['Multi platform', 'Kode cepat', 'Riwayat order'],
  },
]

export const buildSeedOptions = (basePrice, categoryName, title) => {
  const serverNames =
    categoryName === 'Joki Akun'
      ? ['Paket Rank', 'Paket Push', 'Premium Boost']
      : categoryName === 'Akun Games'
        ? ['Starter', 'Reroll', 'Premium']
        : categoryName === 'Voucher & App'
          ? ['Instant Code', 'Bundle', 'Premium Pass']
          : ['Nominal Cepat', 'Paket Populer', 'Premium']

  return [
    {
      name: `${title} Starter`,
      serverName: serverNames[0],
      perk: 'Paling hemat',
      guestPrice: basePrice,
      memberPrice: Math.max(1000, Math.round(basePrice * 0.975)),
      stock: 8,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: `${title} Plus Bundle`,
      serverName: serverNames[1],
      perk: 'Paling dipilih',
      guestPrice: basePrice * 3,
      memberPrice: Math.max(1000, Math.round(basePrice * 3 * 0.975)),
      stock: 5,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: `${title} Premium`,
      serverName: serverNames[2],
      perk: 'Value tinggi',
      guestPrice: basePrice * 5,
      memberPrice: Math.max(1000, Math.round(basePrice * 5 * 0.975)),
      stock: 2,
      isActive: true,
      sortOrder: 3,
    },
  ]
}

