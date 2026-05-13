import { ChevronDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Product } from '../types/store'
import { buildPriceRows, formatCurrency } from '../utils/pricing'

type PriceListPageProps = {
  products: Product[]
}

export function PriceListPage({ products }: PriceListPageProps) {
  const [selectedSlug, setSelectedSlug] = useState(products[0]?.slug ?? '')
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const selectedProduct = products.find((product) => product.slug === selectedSlug) ?? products[0]
  const priceRows = useMemo(() => buildPriceRows(selectedProduct), [selectedProduct])
  const filteredProducts = products.filter((product) =>
    `${product.title} ${product.category} ${product.publisher}`.toLowerCase().includes(query.toLowerCase()),
  )

  if (!selectedProduct) {
    return (
      <main className="price-main">
        <section className="price-header section-surface" aria-labelledby="price-title">
          <span className="section-kicker">Daftar Harga</span>
          <h1 id="price-title">Daftar Harga</h1>
          <p>Belum ada produk aktif dari database.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="price-main">
      <section className="price-header section-surface" aria-labelledby="price-title">
        <span className="section-kicker">Daftar Harga</span>
        <h1 id="price-title">Daftar Harga</h1>
        <p>Bandingkan harga tamu, harga member, dan status produk dalam satu tampilan cepat.</p>
      </section>

      <section className="price-panel section-surface" aria-label="Daftar harga produk">
        <div className="price-selector">
          <label htmlFor="price-search">Daftar Produk</label>
          <button
            className="price-select-trigger"
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span>{selectedProduct.title}</span>
            <ChevronDown size={18} />
          </button>

          {menuOpen && (
            <div className="price-select-menu">
              <div className="price-search">
                <Search size={17} />
                <input
                  id="price-search"
                  placeholder="Cari produk..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="price-select-options">
                {filteredProducts.map((product) => (
                  <button
                    className={product.slug === selectedSlug ? 'is-selected' : ''}
                    key={product.slug}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(product.slug)
                      setMenuOpen(false)
                      setQuery('')
                    }}
                  >
                    <span>{product.title}</span>
                    <small>{product.category}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="price-table-wrap">
          <h2>{selectedProduct.title}</h2>
          <table className="price-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga Tamu</th>
                <th>Harga Member</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{formatCurrency(row.guestPrice)}</td>
                  <td>{formatCurrency(row.memberPrice)}</td>
                  <td>
                    <span className={row.status === 'Tersedia' ? 'price-status is-ready' : 'price-status'}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
