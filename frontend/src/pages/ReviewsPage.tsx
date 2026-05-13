import { Star, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { customerReviews } from '../data/storeData'
import type { CustomerReview } from '../types/store'

const allProducts = 'Semua Games'

function getAverage(reviews: CustomerReview[]) {
  if (!reviews.length) return '0'

  const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
  return Number.isInteger(average) ? String(average) : average.toFixed(2)
}

export function ReviewsPage() {
  const [activeProduct, setActiveProduct] = useState(allProducts)

  const filters = useMemo(() => {
    const products = Array.from(new Set(customerReviews.map((review) => review.product)))
    return [allProducts, ...products]
  }, [])

  const visibleReviews = useMemo(() => {
    if (activeProduct === allProducts) return customerReviews
    return customerReviews.filter((review) => review.product === activeProduct)
  }, [activeProduct])

  const getFilterLabel = (product: string) => {
    const reviews = product === allProducts ? customerReviews : customerReviews.filter((review) => review.product === product)
    return `${product} (${getAverage(reviews)} / 5)`
  }

  return (
    <main className="reviews-main">
      <section className="reviews-hero section-surface" aria-labelledby="reviews-title">
        <span className="reviews-kicker">
          <UsersRound size={17} />
          Reviews Pelanggan
        </span>
        <h1 id="reviews-title">Reviews Pelanggan</h1>
        <p>
          Terima kasih atas kepercayaan pelanggan yang sudah menggunakan layanan DextaaStore. Berikut ulasan
          terbaru yang dirapikan berdasarkan produk dan rating.
        </p>
      </section>

      <section className="reviews-filter-panel section-surface" aria-label="Filter reviews pelanggan">
        <div className="review-filter-list" role="list">
          {filters.map((product) => (
            <button
              className={activeProduct === product ? 'is-active' : ''}
              key={product}
              type="button"
              onClick={() => setActiveProduct(product)}
            >
              {getFilterLabel(product)}
            </button>
          ))}
        </div>
      </section>

      <section className="review-page-grid section-surface" aria-label="Daftar reviews pelanggan">
        {visibleReviews.map((review) => (
          <article className="review-page-card" key={review.id}>
            <div className="review-card-top">
              <div>
                <strong>{review.invoice}</strong>
                <span>{review.product}</span>
              </div>
              <div className="review-stars" aria-label={`${review.rating} dari 5 bintang`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    fill={index < review.rating ? 'currentColor' : 'none'}
                    key={`${review.id}-${index}`}
                    size={16}
                  />
                ))}
              </div>
            </div>
            <time dateTime={review.createdAt}>{review.createdAt}</time>
            <p>{review.message}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
