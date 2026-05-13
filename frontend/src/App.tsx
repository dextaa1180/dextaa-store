import { useEffect, useMemo, useState } from 'react'
import toastr from 'toastr'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'swiper/css'
import 'toastr/build/toastr.min.css'
import './App.css'
import { ChatCta } from './components/ChatCta'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { products as fallbackProducts } from './data/storeData'
import { buildCatalogCategories, gameCatalogRoute } from './data/gameCatalog'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AuthPage } from './pages/AuthPage'
import { ContactPage } from './pages/ContactPage'
import { GameCatalogPage } from './pages/catalog/GameCatalogPage'
import { HomePage } from './pages/HomePage'
import { PriceListPage } from './pages/PriceListPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { TrackingPage } from './pages/TrackingPage'
import { fetchCatalog } from './services/catalog'
import type { CatalogCategory, Product, RouteTarget } from './types/store'

function App() {
  const [routePath, setRoutePath] = useState(window.location.pathname)
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(fallbackProducts)
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>(buildCatalogCategories(fallbackProducts))
  const normalizedRoutePath = useMemo(() => {
    if (routePath !== '/' && routePath.endsWith('/')) {
      return routePath.slice(0, -1)
    }
    return routePath
  }, [routePath])

  useEffect(() => {
    toastr.options = {
      closeButton: true,
      newestOnTop: true,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      timeOut: 2300,
    }
  }, [])

  useEffect(() => {
    const syncRoute = () => setRoutePath(window.location.pathname)
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadCatalog = async () => {
      try {
        const payload = await fetchCatalog()
        if (cancelled) return
        setCatalogProducts(payload.products.length ? payload.products : fallbackProducts)
        setCatalogCategories(
          payload.categories.length ? payload.categories : buildCatalogCategories(payload.products.length ? payload.products : fallbackProducts),
        )
      } catch {
        if (cancelled) return
        setCatalogProducts(fallbackProducts)
        setCatalogCategories(buildCatalogCategories(fallbackProducts))
        toastr.warning('Katalog database belum aktif, menampilkan data cadangan dulu.')
      }
    }

    loadCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  const activeProduct = useMemo(() => {
    if (!normalizedRoutePath.startsWith('/produk/')) return undefined
    return catalogProducts.find((product) => `/produk/${product.slug}` === normalizedRoutePath)
  }, [catalogProducts, normalizedRoutePath])
  const activeCatalogSlug = useMemo(() => {
    if (!normalizedRoutePath.startsWith(`${gameCatalogRoute}/`)) return undefined
    return normalizedRoutePath.slice(gameCatalogRoute.length + 1) || undefined
  }, [normalizedRoutePath])
  const isAdminRoute =
    normalizedRoutePath === '/admin' ||
    normalizedRoutePath === '/admin/login' ||
    normalizedRoutePath === '/admin/dashboard'
  const [productBackTarget, setProductBackTarget] = useState<RouteTarget>({ path: '/', scrollToId: 'produk' })

  const openProduct = (product: Product, backTarget: RouteTarget = { path: '/', scrollToId: 'produk' }) => {
    setProductBackTarget(backTarget)
    window.history.pushState({}, '', `/produk/${product.slug}`)
    setRoutePath(`/produk/${product.slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    setRoutePath(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backHome = () => {
    window.history.pushState({}, '', productBackTarget.path)
    setRoutePath(productBackTarget.path)
    if (productBackTarget.scrollToId) {
      const { scrollToId } = productBackTarget
      window.setTimeout(() => {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth' })
      }, 0)
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPage = () => {
    if (activeProduct) return <ProductDetailPage product={activeProduct} onBackHome={backHome} />
    if (normalizedRoutePath === gameCatalogRoute || normalizedRoutePath.startsWith(`${gameCatalogRoute}/`)) {
      return (
        <GameCatalogPage
          products={catalogProducts}
          categories={catalogCategories}
          activeCategorySlug={activeCatalogSlug}
          currentPath={normalizedRoutePath}
          onNavigate={navigateTo}
          onOpenProduct={openProduct}
        />
      )
    }
    if (normalizedRoutePath === '/daftar-harga') return <PriceListPage products={catalogProducts} />
    if (normalizedRoutePath === '/lacak-pesanan') return <TrackingPage />
    if (normalizedRoutePath === '/reviews-pelanggan') return <ReviewsPage />
    if (normalizedRoutePath === '/hubungi-kami') return <ContactPage />
    if (normalizedRoutePath === '/login') return <AuthPage mode="login" />
    if (normalizedRoutePath === '/register') return <AuthPage mode="register" />
    if (normalizedRoutePath === '/admin' || normalizedRoutePath === '/admin/login') return <AuthPage mode="admin" />
    if (normalizedRoutePath === '/admin/dashboard') return <AdminDashboardPage />
    return <HomePage products={catalogProducts} categories={catalogCategories} onOpenProduct={openProduct} />
  }

  return (
    <div className="app-shell">
      {!isAdminRoute && <SiteHeader />}
      {renderPage()}
      {!isAdminRoute && <SiteFooter />}
      {!isAdminRoute && <ChatCta />}
    </div>
  )
}

export default App
