import { Calculator, Gamepad2, Home, MessageSquare, Newspaper, ReceiptText, Star, Tags, Trophy } from 'lucide-react'
import alfamartLogo from '../assets/payments/alfamart-logo.svg'
import bcaLogo from '../assets/payments/bank-central-asia-(bca)-logo.svg'
import mandiriLogo from '../assets/payments/bank-mandiri-logo.svg'
import bniLogo from '../assets/payments/bank-negara-indonesia-(bni)-logo.svg'
import briLogo from '../assets/payments/bank-rakyat-indonesia-(bri)-logo.svg'
import danaLogo from '../assets/payments/dana-logo.svg'
import gopayLogo from '../assets/payments/gopay-logo.svg'
import indomaretLogo from '../assets/payments/indomaret-logo.svg'
import ovoLogo from '../assets/payments/ovo-logo.svg'
import qrisLogo from '../assets/payments/qris.png'
import shopeepayLogo from '../assets/payments/shopeepay-logo.svg'
import swiperBanner1 from '../assets/swiperbanner1.png'
import swiperBanner2 from '../assets/swiperbanner2.png'
import { gameCatalogRoute } from './gameCatalog'
import type { CustomerReview, NavItem, PaymentGroup, Product } from '../types/store'

export const navigation: NavItem[] = [
  { label: 'Beranda', href: '/#beranda', icon: Home },
  { label: 'Semua Games', href: gameCatalogRoute, icon: Gamepad2 },
  { label: 'Daftar Harga', href: '/daftar-harga', icon: Tags },
  { label: 'Lacak Pesanan', href: '/lacak-pesanan', icon: ReceiptText },
  { label: 'Reviews Pelanggan', href: '/reviews-pelanggan', icon: Star },
  { label: 'Artikel Blog', href: '/#artikel', icon: Newspaper },
  { label: 'Rank Hero MLBB', href: '/#rank-hero', icon: Trophy },
  { label: 'Hubungi Kami', href: '/hubungi-kami', icon: MessageSquare },
  { label: 'Kalkulator', href: '/#kalkulator', icon: Calculator },
]

export const categories = ['Semua', 'Top Up Games', 'Joki Akun', 'Akun Games', 'Voucher & App']

export const products: Product[] = [
  {
    slug: 'mobile-legends-diamond',
    title: 'Mobile Legends Diamond',
    publisher: 'Moonton',
    category: 'Top Up Games',
    price: 'Mulai Rp 1.500',
    basePrice: 1500,
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=720&q=80',
    badge: 'Instan',
    accent: '#1d4ed8',
    description:
      'Top up diamond Mobile Legends dengan alur cepat, pilihan nominal rapi, dan status pesanan yang mudah dipantau.',
    supports: ['ID Server', 'Proses otomatis', 'Promo nominal'],
  },
  {
    slug: 'genshin-genesis-crystal',
    title: 'Genshin Genesis Crystal',
    publisher: 'Hoyoverse',
    category: 'Top Up Games',
    price: 'Mulai Rp 14.000',
    basePrice: 14000,
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=720&q=80',
    badge: 'Promo',
    accent: '#0891b2',
    description: 'Isi Genesis Crystal untuk kebutuhan gacha, blessing, dan bundle dengan detail order yang sederhana.',
    supports: ['UID game', 'Server global', 'Checkout singkat'],
  },
  {
    slug: 'wuthering-reroll-starter',
    title: 'Wuthering Reroll Starter',
    publisher: 'Kuro Game',
    category: 'Akun Games',
    price: 'Mulai Rp 35.000',
    basePrice: 35000,
    image:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=720&q=80',
    badge: 'Stok Baru',
    accent: '#7c3aed',
    description:
      'Pilihan akun starter dan reroll untuk Wuthering Waves dengan stok, spek akun, dan garansi yang jelas.',
    supports: ['Akun starter', 'Cek stok', 'Garansi login'],
  },
  {
    slug: 'honkai-star-rail-express',
    title: 'Honkai Star Rail Express',
    publisher: 'Hoyoverse',
    category: 'Akun Games',
    price: 'Mulai Rp 49.000',
    basePrice: 49000,
    image:
      'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=720&q=80',
    badge: 'Aman',
    accent: '#2563eb',
    description: 'Akun Honkai Star Rail siap pilih dengan catatan karakter, progres, dan instruksi pengamanan.',
    supports: ['Detail akun', 'Panduan aman', 'Stok terbatas'],
  },
  {
    slug: 'joki-rank-mlbb',
    title: 'Joki Rank MLBB',
    publisher: 'Pilot Pro',
    category: 'Joki Akun',
    price: 'Mulai Rp 25.000',
    basePrice: 25000,
    image:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=720&q=80',
    badge: 'Fast Slot',
    accent: '#ea580c',
    description: 'Layanan joki rank Mobile Legends dengan pilihan paket, estimasi pengerjaan, dan catatan request.',
    supports: ['Pilih tier', 'Slot cepat', 'Progress update'],
  },
  {
    slug: 'weekly-pass-voucher',
    title: 'Weekly Pass & Voucher',
    publisher: 'Multi Platform',
    category: 'Voucher & App',
    price: 'Mulai Rp 9.000',
    basePrice: 9000,
    image:
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=720&q=80',
    badge: 'Lengkap',
    accent: '#0f766e',
    description: 'Voucher dan weekly pass lintas platform dalam satu tempat, cocok untuk pembelian rutin.',
    supports: ['Multi platform', 'Kode cepat', 'Riwayat order'],
  },
]

export const bannerSlides = [
  { title: 'Beli akun game cepat, aman, dan terpercaya', image: swiperBanner1 },
  { title: 'Kebutuhan gaming beres dalam sekejap', image: swiperBanner2 },
]

export const reviews = [
  ['Wuthering Reroll', 'Order cepat, akun sesuai spek dan instruksinya jelas.', 'Fadli', '13 Mei 26'],
  ['Mobile Legends', 'Diamond masuk kurang dari satu menit. Mantap.', 'Rani', '12 Mei 26'],
  ['Joki Akun', 'Admin responsif, progres dikabarin terus sampai selesai.', 'Kevin', '11 Mei 26'],
  ['Honkai Star Rail', 'Harga oke, pilihan akun juga rapi buat dibandingin.', 'Nadia', '10 Mei 26'],
]

export const customerReviews: CustomerReview[] = [
  {
    id: 'rvw-001',
    invoice: 'DXT********513',
    product: 'Mobile Legends Diamond',
    rating: 5,
    message: 'Diamond masuk cepat, prosesnya rapi dan admin responsif.',
    createdAt: '13-05-2026 09:37:32',
  },
  {
    id: 'rvw-002',
    invoice: 'DXT********740',
    product: 'Mobile Legends Diamond',
    rating: 5,
    message: 'Harga oke, checkout gampang, cocok buat top up dadakan.',
    createdAt: '13-05-2026 08:54:47',
  },
  {
    id: 'rvw-003',
    invoice: 'DXT********277',
    product: 'Genshin Genesis Crystal',
    rating: 5,
    message: 'Genesis crystal masuk tanpa ribet. Instruksi UID jelas.',
    createdAt: '10-05-2026 19:24:19',
  },
  {
    id: 'rvw-004',
    invoice: 'DXT********604',
    product: 'Honkai Star Rail Express',
    rating: 5,
    message: 'Akun sesuai deskripsi, detail login dan pengamanan lengkap.',
    createdAt: '01-05-2026 23:11:43',
  },
  {
    id: 'rvw-005',
    invoice: 'DXT********239',
    product: 'Honkai Star Rail Express',
    rating: 5,
    message: 'Pilihan akun enak dibandingkan, stoknya juga jelas.',
    createdAt: '26-12-2025 20:19:03',
  },
  {
    id: 'rvw-006',
    invoice: 'DXT********531',
    product: 'Wuthering Reroll Starter',
    rating: 5,
    message: 'Starter aman, spek akun sama seperti yang dipilih.',
    createdAt: '05-05-2026 00:47:26',
  },
  {
    id: 'rvw-007',
    invoice: 'DXT********911',
    product: 'Wuthering Reroll Starter',
    rating: 5,
    message: 'Garansi dan instruksinya jelas, jadi lebih tenang.',
    createdAt: '03-05-2026 10:39:06',
  },
  {
    id: 'rvw-008',
    invoice: 'DXT********580',
    product: 'Wuthering Reroll Starter',
    rating: 5,
    message: 'Proses cepat dan akun bisa langsung diamankan.',
    createdAt: '02-05-2026 14:07:09',
  },
  {
    id: 'rvw-009',
    invoice: 'DXT********795',
    product: 'Joki Rank MLBB',
    rating: 5,
    message: 'Progress dikabarin terus, selesai sesuai estimasi.',
    createdAt: '02-05-2026 14:06:57',
  },
  {
    id: 'rvw-010',
    invoice: 'DXT********877',
    product: 'Joki Rank MLBB',
    rating: 4,
    message: 'Hasilnya bagus, tinggal dibuat tracking progres nanti makin mantap.',
    createdAt: '02-05-2026 14:06:40',
  },
  {
    id: 'rvw-011',
    invoice: 'DXT********770',
    product: 'Weekly Pass & Voucher',
    rating: 5,
    message: 'Kode voucher cepat masuk dan bisa langsung dipakai.',
    createdAt: '02-05-2026 14:05:32',
  },
  {
    id: 'rvw-012',
    invoice: 'DXT********718',
    product: 'Genshin Genesis Crystal',
    rating: 5,
    message: 'Top up aman, bukti order jelas, recommended.',
    createdAt: '02-05-2026 11:46:22',
  },
]

export const faqs = [
  [
    'Berapa lama pesanan diproses?',
    'Top up otomatis biasanya selesai dalam hitungan detik sampai beberapa menit setelah pembayaran berhasil. Layanan akun dan joki mengikuti antrian dan detail order.',
  ],
  [
    'Metode pembayaran apa saja yang tersedia?',
    'Frontend ini menampilkan dukungan QRIS, e-wallet, virtual account, dan transfer bank sebagai rancangan awal. Integrasi payment gateway bisa ditambahkan pada tahap backend.',
  ],
  [
    'Apakah akun game aman dibeli?',
    'Setiap listing dirancang punya status inspeksi, catatan risiko, dan panduan pengamanan. Detail final perlu disesuaikan dengan kebijakan toko saat backend aktif.',
  ],
]

export const paymentGroups: PaymentGroup[] = [
  {
    channels: [
      { logo: qrisLogo, name: 'QRIS' },
      { logo: danaLogo, name: 'DANA' },
      { logo: ovoLogo, name: 'OVO' },
      { logo: gopayLogo, name: 'GoPay' },
      { logo: shopeepayLogo, name: 'Shopee Pay' },
    ],
    id: 'E-Money',
  },
  {
    channels: [
      { logo: briLogo, name: 'BRI' },
      { logo: bniLogo, name: 'BNI' },
      { logo: bcaLogo, name: 'BCA' },
      { logo: mandiriLogo, name: 'Mandiri' },
    ],
    id: 'Virtual Account',
  },
  {
    channels: [
      { logo: alfamartLogo, name: 'Alfamart' },
      { logo: indomaretLogo, name: 'Indomaret' },
    ],
    id: 'Convenience Store',
  },
]

export const warranties = ['Standar 1 hari', 'Prioritas 3 hari', 'Extra aman 7 hari']

export const footerPaymentLogos = [
  { logo: danaLogo, name: 'DANA' },
  { logo: ovoLogo, name: 'OVO' },
  { logo: shopeepayLogo, name: 'ShopeePay' },
  { logo: qrisLogo, name: 'QRIS' },
  { logo: bcaLogo, name: 'BCA' },
]

export const footerLinks = [
  { href: '/#top', label: 'Home' },
  { href: gameCatalogRoute, label: 'Semua Games' },
  { href: '/lacak-pesanan', label: 'Lacak Pesanan' },
  { href: '/reviews-pelanggan', label: 'Reviews Pelanggan' },
  { href: '/hubungi-kami', label: 'Hubungi Kami' },
  { href: '/admin/login', label: 'Login Admin' },
  { href: '/#top', label: 'Syarat & Ketentuan' },
]
