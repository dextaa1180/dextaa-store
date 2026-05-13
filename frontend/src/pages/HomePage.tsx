import { Clock3, CreditCard, Gamepad2, Headphones, ShieldCheck, Star, UserRound, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import toastr from 'toastr'
import { bannerSlides, faqs, reviews } from '../data/storeData'
import { buildCatalogCategories, getProductCategorySlug } from '../data/gameCatalog'
import type { Product } from '../types/store'
import type { CatalogCategory } from '../types/store'

type HomePageProps = {
  categories: CatalogCategory[]
  products: Product[]
  onOpenProduct: (product: Product) => void
}

export function HomePage({ categories, products, onOpenProduct }: HomePageProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState('all')

  const visibleProducts = useMemo(() => {
    if (activeCategorySlug === 'all') return products
    return products.filter((product) => getProductCategorySlug(product) === activeCategorySlug)
  }, [activeCategorySlug, products])

  const categoryTabs = useMemo(() => {
    const derived = categories.length ? categories : buildCatalogCategories(products)
    return [{ id: 'all', name: 'Semua', slug: 'all', sortOrder: 0, productCount: products.length }, ...derived]
  }, [categories, products])

  const handleCategoryChange = (slug: string, label: string) => {
    setActiveCategorySlug(slug)
    toastr.info(slug === 'all' ? 'Menampilkan semua layanan.' : `Filter: ${label}`)
  }

  return (
    <main id="top">
      <section className="banner-section" id="beranda" aria-label="Promo DextaaStore">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          centeredSlides
          grabCursor
          loop
          loopAdditionalSlides={2}
          slidesPerView={1.02}
          spaceBetween={14}
          speed={650}
          breakpoints={{
            760: { slidesPerView: 1.08, spaceBetween: 20 },
            1120: { slidesPerView: 1.18, spaceBetween: 28 },
          }}
          className="swiperBanner"
        >
          {bannerSlides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <article className="banner-card">
                <img src={slide.image} alt={slide.title} />
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="popular-section section-surface" id="produk" aria-labelledby="popular-title">
        <h2 className="popular-title" id="popular-title">
          Populer Saat Ini
        </h2>

        <div className="popular-grid">
          {products.map((product) => (
            <button className="popular-card" key={product.title} type="button" onClick={() => onOpenProduct(product)}>
              <img className="popular-bg" src={product.image} alt="" />
              <div className="popular-shade" />
              <img className="popular-thumb" src={product.image} alt="" />
              <div className="popular-copy">
                <span>{product.publisher}</span>
                <h3>
                  {product.title
                    .replace(' Diamond', '')
                    .replace(' Genesis Crystal', '')
                    .replace(' Starter', '')
                    .replace(' Express', '')}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="catalog-section section-surface" id="semua-games" aria-label="Katalog produk">
        <div className="category-tabs" role="tablist" aria-label="Kategori produk">
          {categoryTabs.map((category) => (
            <button
              className={category.slug === activeCategorySlug ? 'is-active' : ''}
              key={category.slug}
              onClick={() => handleCategoryChange(category.slug, category.name)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="catalog-grid">
          {visibleProducts.map((product) => (
            <article
              className="catalog-card card border-0"
              key={product.title}
              onClick={() => onOpenProduct(product)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenProduct(product)
                }
              }}
            >
              <img src={product.image} alt="" />
              <div className="catalog-card-shade" />
              <div className="catalog-card-content">
                <div>
                  <span className="product-badge" style={{ color: product.accent }}>
                    {product.category}
                  </span>
                  <h3>{product.title}</h3>
                  <p>{product.price.replace('Mulai ', '')}</p>
                </div>
                <button
                  className="buy-button"
                  type="button"
                  aria-label={`Buka detail ${product.title}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpenProduct(product)
                  }}
                >
                  Beli
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-band" aria-label="Kepercayaan toko">
        <div>
          <ShieldCheck size={24} />
          <strong>12.8K+</strong>
          <span>Pengguna</span>
        </div>
        <div>
          <Gamepad2 size={24} />
          <strong>640+</strong>
          <span>Produk aktif</span>
        </div>
        <div>
          <Clock3 size={24} />
          <strong>24/7</strong>
          <span>Checkout</span>
        </div>
        <div>
          <Headphones size={24} />
          <strong>4.9/5</strong>
          <span>Dukungan</span>
        </div>
      </section>

      <section className="two-column-section" id="reviews" aria-label="Review dan pembayaran">
        <div className="reviews-panel">
          <div className="section-heading">
            <span className="section-kicker">Reviews Pelanggan</span>
            <h2>Feedback transaksi terbaru</h2>
          </div>
          <div className="review-list">
            {reviews.map(([service, quote, name, date]) => (
              <article className="review-card" key={`${service}-${date}`}>
                <div className="stars" aria-label="5 bintang">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star fill="currentColor" key={index} size={14} />
                  ))}
                </div>
                <h3>{service}</h3>
                <p>{quote}</p>
                <span>
                  {name} - {date}
                </span>
              </article>
            ))}
          </div>
        </div>

        <aside className="payment-panel" id="lacak-transaksi">
          <span className="section-kicker">Pembayaran & tracking</span>
          <h2>Checkout ringkas, status pesanan jelas.</h2>
          <div className="payment-options">
            <span>
              <WalletCards size={18} /> QRIS
            </span>
            <span>
              <CreditCard size={18} /> Virtual Account
            </span>
            <span>
              <UserRound size={18} /> E-Wallet
            </span>
          </div>
          <div className="tracking-box">
            <span>Invoice</span>
            <strong>DXT********42</strong>
            <button className="primary-button" type="button">
              Cek Status
            </button>
          </div>
        </aside>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div className="section-heading">
          <span className="section-kicker">FAQ</span>
          <h2 id="faq-title">Pertanyaan yang sering muncul</h2>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question} open={question === faqs[0][0]}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
