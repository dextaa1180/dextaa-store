import { Search } from 'lucide-react'
import { useMemo, useState, type MouseEvent } from 'react'
import {
  countGameCatalogProducts,
  buildCatalogCategories,
  gameCatalogRoute,
  getCatalogProductsByCategory,
  getCatalogCategoryIcon,
} from '../../data/gameCatalog'
import type { CatalogCategory, Product, RouteTarget } from '../../types/store'

type GameCatalogPageProps = {
  products: Product[]
  categories: CatalogCategory[]
  activeCategorySlug?: string
  currentPath: string
  onNavigate: (path: string) => void
  onOpenProduct: (product: Product, backTarget?: RouteTarget) => void
}

export function GameCatalogPage({
  products,
  categories,
  activeCategorySlug,
  currentPath,
  onNavigate,
  onOpenProduct,
}: GameCatalogPageProps) {
  const [search, setSearch] = useState('')

  const catalogCategories = useMemo(
    () => (categories.length ? categories : buildCatalogCategories(products)),
    [categories, products],
  )

  const visibleProducts = useMemo(() => {
    const pool = getCatalogProductsByCategory(products, activeCategorySlug)
    const query = search.trim().toLowerCase()
    if (!query) return pool
    return pool.filter((product) => `${product.title} ${product.publisher} ${product.category}`.toLowerCase().includes(query))
  }, [activeCategorySlug, products, search])

  const stats = useMemo(
    () =>
      catalogCategories.map((category) => ({
        ...category,
        count: countGameCatalogProducts(products, category.slug),
      })),
    [catalogCategories, products],
  )

  const activePath = activeCategorySlug && activeCategorySlug !== 'all' ? `${gameCatalogRoute}/${activeCategorySlug}` : gameCatalogRoute

  const handleCategoryNavigate = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <main className="games-main">
      <section className="games-hero section-surface" aria-labelledby="games-title">
        <span className="section-kicker">Semua Games</span>
        <h1 id="games-title">Semua Games</h1>
        <p>Temuin game favorit kamu di sini.</p>

        <label className="games-search">
          <Search size={18} />
          <input
            placeholder="Cari kategori, game, atau publisher..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="games-category-strip section-surface" aria-label="Kategori database">
        {stats.map((category) => {
          const href = `${gameCatalogRoute}/${category.slug}`
          const isActive = currentPath === href
          const Icon = getCatalogCategoryIcon(category.name)
          return (
            <a
              className={isActive ? 'is-active' : ''}
              href={href}
              key={category.slug}
              onClick={(event) => handleCategoryNavigate(event, href)}
            >
              <span className="games-category-icon">
                <Icon size={18} />
              </span>
              <span>
                <strong>{category.name}</strong>
                <small>Database category</small>
              </span>
              <em>{category.count} produk</em>
            </a>
          )
        })}
      </section>

      <section className="games-content section-surface" aria-label="Daftar semua games">
        <div className="category-tabs" role="tablist" aria-label="Filter kategori">
          <button
            className={activePath === gameCatalogRoute ? 'is-active' : ''}
            type="button"
            onClick={() => onNavigate(gameCatalogRoute)}
          >
            Semua
          </button>
          {catalogCategories.map((category) => {
            const path = `${gameCatalogRoute}/${category.slug}`
            return (
              <button
                className={activePath === path ? 'is-active' : ''}
                key={category.slug}
                type="button"
                onClick={() => onNavigate(path)}
              >
                {category.name}
              </button>
            )
          })}
        </div>

        <div className="catalog-grid">
          {visibleProducts.map((product) => (
            <article
              className="catalog-card card border-0"
              key={product.title}
              role="button"
              tabIndex={0}
              onClick={() => onOpenProduct(product, { path: currentPath })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenProduct(product, { path: currentPath })
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
                    onOpenProduct(product, { path: currentPath })
                  }}
                >
                  Beli
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
