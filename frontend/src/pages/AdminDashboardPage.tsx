import { Boxes, MessageSquareText, ReceiptText, Star, Tags } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import toastr from 'toastr'
import { AdminSidebar } from '../components/admin/AdminSidebar'

type AdminCategory = { id: string; name: string; slug: string }
type AdminProduct = {
  id: string
  title: string
  publisher: string
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  category: { id: string; name: string }
  coverImageUrl: string | null
  coverImagePublicId: string | null
  badge: string | null
}
type AdminPriceOption = {
  id: string
  productId: string
  name: string
  serverName: string | null
  guestPrice: number
  memberPrice: number
  stock: number
  isActive: boolean
  product: { id: string; title: string }
}
type AdminTransaction = {
  id: string
  invoiceCode: string
  customerName: string | null
  customerWhatsapp: string
  subtotal: number
  total: number
  status: string
  paymentStatus: string
}
type PaginationMeta = { page: number; pageSize: number; total: number; totalPages: number }

const sidebarMenus = [
  { key: 'products', label: 'Product List', icon: Boxes },
  { key: 'prices', label: 'Price List', icon: Tags },
  { key: 'transactions', label: 'Transaction List', icon: ReceiptText },
] as const

type SidebarMenuKey = (typeof sidebarMenus)[number]['key']

const emptyProductForm = {
  title: '',
  publisher: '',
  categoryName: '',
  coverImageUrl: '',
  coverImagePublicId: '',
  badge: '',
  status: 'ACTIVE',
}

const emptyOptionForm = {
  productId: '',
  name: '',
  serverName: '',
  guestPrice: '0',
  memberPrice: '0',
  stock: '0',
}

const emptyTransactionForm = {
  invoiceCode: '',
  customerName: '',
  customerWhatsapp: '',
  subtotal: '0',
  total: '0',
  status: 'PENDING',
  paymentStatus: 'UNPAID',
}

const defaultPagination: PaginationMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
}

const toQuery = (params: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((carry, [key, value]) => {
      if (value === undefined || value === '') return carry
      carry[key] = String(value)
      return carry
    }, {}),
  ).toString()

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('Admin')
  const [activeMenu, setActiveMenu] = useState<SidebarMenuKey>('products')
  const [summary, setSummary] = useState({
    products: 0,
    orders: 0,
    reviews: 0,
    contactRequests: 0,
  })
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [priceOptions, setPriceOptions] = useState<AdminPriceOption[]>([])
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [optionForm, setOptionForm] = useState(emptyOptionForm)
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [productImageUploading, setProductImageUploading] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState('')
  const [productPagination, setProductPagination] = useState<PaginationMeta>(defaultPagination)

  const [optionSearch, setOptionSearch] = useState('')
  const [optionProductFilter, setOptionProductFilter] = useState('')
  const [optionActiveFilter, setOptionActiveFilter] = useState('')
  const [optionPagination, setOptionPagination] = useState<PaginationMeta>(defaultPagination)

  const [transactionSearch, setTransactionSearch] = useState('')
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('')
  const [transactionPaymentFilter, setTransactionPaymentFilter] = useState('')
  const [transactionPagination, setTransactionPagination] = useState<PaginationMeta>(defaultPagination)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const meResponse = await fetch('/api/auth/me', { credentials: 'include' })
        if (!meResponse.ok) {
          window.location.href = '/admin/login'
          return
        }

        const mePayload = await meResponse.json()

        if (mePayload.user.role !== 'ADMIN') {
          window.location.href = '/admin/login'
          return
        }

        setAdminName(mePayload.user.name)

        const [summaryResponse, categoryResponse, productResponse, optionResponse, txResponse] = await Promise.all([
          fetch('/api/admin/summary', { credentials: 'include' }),
          fetch('/api/admin/categories', { credentials: 'include' }),
          fetch('/api/admin/products?page=1&pageSize=10', { credentials: 'include' }),
          fetch('/api/admin/price-options?page=1&pageSize=10', { credentials: 'include' }),
          fetch('/api/admin/transactions?page=1&pageSize=10', { credentials: 'include' }),
        ])

        if (summaryResponse.ok) {
          setSummary(await summaryResponse.json())
        } else {
          toastr.warning('Dashboard terbuka, tetapi ringkasan belum dapat dimuat.')
        }

        if (categoryResponse.ok) {
          const categoryPayload = await categoryResponse.json()
          setCategories(categoryPayload.categories ?? [])
        } else {
          toastr.warning('Kategori belum dapat dimuat.')
        }

        if (productResponse.ok) {
          const productPayload = await productResponse.json()
          setProducts(productPayload.products ?? [])
          setProductPagination(productPayload.pagination ?? defaultPagination)
        } else {
          toastr.warning('Product list belum dapat dimuat.')
        }

        if (optionResponse.ok) {
          const optionPayload = await optionResponse.json()
          setPriceOptions(optionPayload.options ?? [])
          setOptionPagination(optionPayload.pagination ?? defaultPagination)
        } else {
          toastr.warning('Price list belum dapat dimuat.')
        }

        if (txResponse.ok) {
          const txPayload = await txResponse.json()
          setTransactions(txPayload.transactions ?? [])
          setTransactionPagination(txPayload.pagination ?? defaultPagination)
        } else {
          toastr.warning('Transaction list belum dapat dimuat.')
        }
      } catch {
        toastr.error('Gagal memuat data dashboard admin.')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  const loadProducts = async (override?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
  }) => {
    const page = override?.page ?? productPagination.page
    const pageSize = override?.pageSize ?? productPagination.pageSize
    const search = override?.search ?? productSearch
    const status = override?.status ?? productStatusFilter
    const queryString = toQuery({ q: search, status, page, pageSize })
    const response = await fetch(`/api/admin/products?${queryString}`, { credentials: 'include' })
    if (!response.ok) throw new Error('load products failed')
    const payload = await response.json()
    setProducts(payload.products ?? [])
    setProductPagination(payload.pagination ?? defaultPagination)
  }

  const loadOptions = async (override?: {
    page?: number
    pageSize?: number
    search?: string
    productId?: string
    isActive?: string
  }) => {
    const page = override?.page ?? optionPagination.page
    const pageSize = override?.pageSize ?? optionPagination.pageSize
    const search = override?.search ?? optionSearch
    const productId = override?.productId ?? optionProductFilter
    const isActive = override?.isActive ?? optionActiveFilter
    const queryString = toQuery({
      q: search,
      productId,
      isActive,
      page,
      pageSize,
    })
    const response = await fetch(`/api/admin/price-options?${queryString}`, { credentials: 'include' })
    if (!response.ok) throw new Error('load options failed')
    const payload = await response.json()
    setPriceOptions(payload.options ?? [])
    setOptionPagination(payload.pagination ?? defaultPagination)
  }

  const loadTransactions = async (override?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    paymentStatus?: string
  }) => {
    const page = override?.page ?? transactionPagination.page
    const pageSize = override?.pageSize ?? transactionPagination.pageSize
    const search = override?.search ?? transactionSearch
    const status = override?.status ?? transactionStatusFilter
    const paymentStatus = override?.paymentStatus ?? transactionPaymentFilter
    const queryString = toQuery({
      q: search,
      status,
      paymentStatus,
      page,
      pageSize,
    })
    const response = await fetch(`/api/admin/transactions?${queryString}`, { credentials: 'include' })
    if (!response.ok) throw new Error('load transactions failed')
    const payload = await response.json()
    setTransactions(payload.transactions ?? [])
    setTransactionPagination(payload.pagination ?? defaultPagination)
  }

  const loadSummary = async () => {
    const response = await fetch('/api/admin/summary', { credentials: 'include' })
    if (!response.ok) throw new Error('load summary failed')
    setSummary(await response.json())
  }

  const onProductSearchChange = async (value: string) => {
    setProductSearch(value)
    await loadProducts({ page: 1, search: value })
  }

  const onProductStatusChange = async (value: string) => {
    setProductStatusFilter(value)
    await loadProducts({ page: 1, status: value })
  }

  const onOptionSearchChange = async (value: string) => {
    setOptionSearch(value)
    await loadOptions({ page: 1, search: value })
  }

  const onOptionProductChange = async (value: string) => {
    setOptionProductFilter(value)
    await loadOptions({ page: 1, productId: value })
  }

  const onOptionActiveChange = async (value: string) => {
    setOptionActiveFilter(value)
    await loadOptions({ page: 1, isActive: value })
  }

  const onTransactionSearchChange = async (value: string) => {
    setTransactionSearch(value)
    await loadTransactions({ page: 1, search: value })
  }

  const onTransactionStatusChange = async (value: string) => {
    setTransactionStatusFilter(value)
    await loadTransactions({ page: 1, status: value })
  }

  const onTransactionPaymentChange = async (value: string) => {
    setTransactionPaymentFilter(value)
    await loadTransactions({ page: 1, paymentStatus: value })
  }

  const dashboardStats = useMemo(
    () => [
      { label: 'Produk Aktif', value: String(summary.products), icon: Boxes },
      { label: 'Pesanan Baru', value: String(summary.orders), icon: ReceiptText },
      { label: 'Review Pending', value: String(summary.reviews), icon: Star },
      { label: 'Laporan Baru', value: String(summary.contactRequests), icon: MessageSquareText },
    ],
    [summary],
  )

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch(
      editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products',
      {
        method: editingProductId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      },
    )

    if (!response.ok) {
      toastr.error(editingProductId ? 'Gagal mengubah produk.' : 'Gagal menambahkan produk.')
      return
    }

    toastr.success(editingProductId ? 'Produk diperbarui.' : 'Produk ditambahkan.')
    setProductForm(emptyProductForm)
    setEditingProductId(null)
    await Promise.all([loadProducts(), loadSummary()])
  }

  const uploadProductImage = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    setProductImageUploading(true)

    try {
      const response = await fetch('/api/admin/uploads/product-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message ?? 'Gagal upload gambar.')
      }

      setProductForm((previous) => ({
        ...previous,
        coverImagePublicId: payload.publicId,
        coverImageUrl: payload.url,
      }))
      toastr.success('Gambar produk berhasil diupload.')
    } catch (error) {
      toastr.error(error instanceof Error ? error.message : 'Gagal upload gambar.')
    } finally {
      setProductImageUploading(false)
    }
  }

  const beginEditProduct = (product: AdminProduct) => {
    setEditingProductId(product.id)
    setProductForm({
      title: product.title,
      publisher: product.publisher,
      categoryName: product.category.name,
      coverImagePublicId: product.coverImagePublicId ?? '',
      coverImageUrl: product.coverImageUrl ?? '',
      badge: product.badge ?? '',
      status: product.status,
    })
  }

  const cancelEditProduct = () => {
    setEditingProductId(null)
    setProductForm(emptyProductForm)
  }

  const removeProduct = async (id: string) => {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      toastr.error('Gagal menghapus produk.')
      return
    }

    toastr.info('Produk dihapus.')
    await Promise.all([loadProducts(), loadSummary()])
  }

  const submitOption = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch(
      editingOptionId ? `/api/admin/price-options/${editingOptionId}` : '/api/admin/price-options',
      {
        method: editingOptionId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...optionForm,
          guestPrice: Number(optionForm.guestPrice),
          memberPrice: Number(optionForm.memberPrice),
          stock: Number(optionForm.stock),
        }),
      },
    )

    if (!response.ok) {
      toastr.error(editingOptionId ? 'Gagal mengubah daftar harga.' : 'Gagal menambahkan daftar harga.')
      return
    }

    toastr.success(editingOptionId ? 'Daftar harga diperbarui.' : 'Daftar harga ditambahkan.')
    setOptionForm(emptyOptionForm)
    setEditingOptionId(null)
    await loadOptions()
  }

  const beginEditOption = (option: AdminPriceOption) => {
    setEditingOptionId(option.id)
    setOptionForm({
      productId: option.productId,
      name: option.name,
      serverName: option.serverName ?? '',
      guestPrice: String(option.guestPrice),
      memberPrice: String(option.memberPrice),
      stock: String(option.stock),
    })
  }

  const cancelEditOption = () => {
    setEditingOptionId(null)
    setOptionForm(emptyOptionForm)
  }

  const removePriceOption = async (id: string) => {
    const response = await fetch(`/api/admin/price-options/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      toastr.error('Gagal menghapus item harga.')
      return
    }

    toastr.info('Item harga dihapus.')
    await loadOptions()
  }

  const submitTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch(
      editingTransactionId ? `/api/admin/transactions/${editingTransactionId}` : '/api/admin/transactions',
      {
        method: editingTransactionId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          subtotal: Number(transactionForm.subtotal),
          total: Number(transactionForm.total),
        }),
      },
    )

    if (!response.ok) {
      toastr.error(editingTransactionId ? 'Gagal mengubah transaksi.' : 'Gagal menambahkan transaksi.')
      return
    }

    toastr.success(editingTransactionId ? 'Transaksi diperbarui.' : 'Transaksi ditambahkan.')
    setTransactionForm(emptyTransactionForm)
    setEditingTransactionId(null)
    await Promise.all([loadTransactions(), loadSummary()])
  }

  const beginEditTransaction = (transaction: AdminTransaction) => {
    setEditingTransactionId(transaction.id)
    setTransactionForm({
      invoiceCode: transaction.invoiceCode,
      customerName: transaction.customerName ?? '',
      customerWhatsapp: transaction.customerWhatsapp,
      subtotal: String(transaction.subtotal),
      total: String(transaction.total),
      status: transaction.status,
      paymentStatus: transaction.paymentStatus,
    })
  }

  const cancelEditTransaction = () => {
    setEditingTransactionId(null)
    setTransactionForm(emptyTransactionForm)
  }

  const removeTransaction = async (id: string) => {
    const response = await fetch(`/api/admin/transactions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      toastr.error('Gagal menghapus transaksi.')
      return
    }

    toastr.info('Transaksi dihapus.')
    await Promise.all([loadTransactions(), loadSummary()])
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    toastr.info('Sesi admin ditutup.')
    window.location.href = '/admin/login'
  }

  if (loading) {
    return (
      <main className="admin-main">
        <section className="admin-hero section-surface">
          <span className="admin-kicker">Dashboard Admin</span>
          <h1>Memeriksa sesi admin</h1>
          <p>Mohon tunggu sebentar.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-main">
      <div className="admin-shell">
        <AdminSidebar
          adminName={adminName}
          activeMenu={activeMenu}
          menus={sidebarMenus}
          onSelectMenu={setActiveMenu}
          onLogout={handleLogout}
        />

        <div className="admin-content">
          <section className="admin-hero section-surface" aria-labelledby="admin-title">
            <div>
              <span className="admin-kicker">Dashboard Admin</span>
              <h1 id="admin-title">Panel Operasional DextaaStore</h1>
              <p>Selamat datang, {adminName}. Dashboard ini sudah membaca ringkasan dari API admin.</p>
            </div>
          </section>

          <section className="admin-stat-grid section-surface" aria-label="Ringkasan dashboard">
            {dashboardStats.map(({ label, value, icon: Icon }) => (
              <article key={label}>
                <Icon size={22} />
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </section>

          <section className="admin-crud-panel section-surface" aria-label="CRUD dashboard admin">
          {activeMenu === 'products' && (
            <section>
              <h2>Product List</h2>
              <div className="admin-toolbar">
                <input
                  placeholder="Search title/publisher/category"
                  value={productSearch}
                  onChange={(event) => {
                    onProductSearchChange(event.target.value).catch(() =>
                      toastr.error('Gagal memuat product list.'),
                    )
                  }}
                />
                <select
                  value={productStatusFilter}
                  onChange={(event) => {
                    onProductStatusChange(event.target.value).catch(() =>
                      toastr.error('Gagal memuat product list.'),
                    )
                  }}
                >
                  <option value="">All status</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <select
                  value={String(productPagination.pageSize)}
                  onChange={(event) => {
                    loadProducts({ page: 1, pageSize: Number(event.target.value) }).catch(() =>
                      toastr.error('Gagal memuat product list.'),
                    )
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
              <form className="admin-crud-form" onSubmit={submitProduct}>
                <input
                  placeholder="Product title"
                  required
                  value={productForm.title}
                  onChange={(event) => setProductForm((previous) => ({ ...previous, title: event.target.value }))}
                />
                <input
                  placeholder="Publisher"
                  required
                  value={productForm.publisher}
                  onChange={(event) =>
                    setProductForm((previous) => ({ ...previous, publisher: event.target.value }))
                  }
                />
                <input
                  list="admin-categories"
                  placeholder="Category"
                  required
                  value={productForm.categoryName}
                  onChange={(event) =>
                    setProductForm((previous) => ({ ...previous, categoryName: event.target.value }))
                  }
                />
                <datalist id="admin-categories">
                  {categories.map((category) => (
                    <option key={category.id} value={category.name} />
                  ))}
                </datalist>
                <input
                  placeholder="Badge (optional)"
                  value={productForm.badge}
                  onChange={(event) => setProductForm((previous) => ({ ...previous, badge: event.target.value }))}
                />
                <input
                  placeholder="Cover image URL"
                  value={productForm.coverImageUrl}
                  onChange={(event) =>
                    setProductForm((previous) => ({
                      ...previous,
                      coverImagePublicId: '',
                      coverImageUrl: event.target.value,
                    }))
                  }
                />
                <label className="admin-upload-control">
                  <span>{productImageUploading ? 'Uploading...' : 'Upload Cover'}</span>
                  <input
                    accept="image/*"
                    disabled={productImageUploading}
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (file) uploadProductImage(file)
                    }}
                  />
                </label>
                <select
                  value={productForm.status}
                  onChange={(event) => setProductForm((previous) => ({ ...previous, status: event.target.value }))}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <button type="submit">{editingProductId ? 'Simpan Produk' : 'Tambah Produk'}</button>
                {editingProductId && (
                  <button type="button" className="admin-secondary-button" onClick={cancelEditProduct}>
                    Batal Edit
                  </button>
                )}
                {productForm.coverImageUrl && (
                  <div className="admin-image-preview">
                    <img src={productForm.coverImageUrl} alt="" />
                    <span>Cover tersimpan untuk produk ini.</span>
                  </div>
                )}
              </form>

              <div className="admin-list-table">
                {products.map((product) => (
                  <article key={product.id}>
                    <div className="admin-product-summary">
                      {product.coverImageUrl && <img src={product.coverImageUrl} alt="" />}
                      <div>
                      <strong>{product.title}</strong>
                      <small>
                        {product.publisher} - {product.category.name} - {product.status}
                      </small>
                      </div>
                    </div>
                    <div className="admin-row-actions">
                      <button type="button" className="admin-edit-button" onClick={() => beginEditProduct(product)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => removeProduct(product.id)}>
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={productPagination.page <= 1}
                  onClick={() => {
                    loadProducts({ page: Math.max(1, productPagination.page - 1) }).catch(() =>
                      toastr.error('Gagal memuat product list.'),
                    )
                  }}
                >
                  Prev
                </button>
                <span>
                  Page {productPagination.page} / {productPagination.totalPages} ({productPagination.total} items)
                </span>
                <button
                  type="button"
                  disabled={productPagination.page >= productPagination.totalPages}
                  onClick={() => {
                    loadProducts({ page: Math.min(productPagination.totalPages, productPagination.page + 1) }).catch(
                      () => toastr.error('Gagal memuat product list.'),
                    )
                  }}
                >
                  Next
                </button>
              </div>
            </section>
          )}

          {activeMenu === 'prices' && (
            <section>
              <h2>Price List</h2>
              <div className="admin-toolbar">
                <input
                  placeholder="Search option or product"
                  value={optionSearch}
                  onChange={(event) => {
                    onOptionSearchChange(event.target.value).catch(() => toastr.error('Gagal memuat price list.'))
                  }}
                />
                <select
                  value={optionProductFilter}
                  onChange={(event) => {
                    onOptionProductChange(event.target.value).catch(() => toastr.error('Gagal memuat price list.'))
                  }}
                >
                  <option value="">All products</option>
                  {categories.length >= 0 &&
                    products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                </select>
                <select
                  value={optionActiveFilter}
                  onChange={(event) => {
                    onOptionActiveChange(event.target.value).catch(() => toastr.error('Gagal memuat price list.'))
                  }}
                >
                  <option value="">All active states</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <select
                  value={String(optionPagination.pageSize)}
                  onChange={(event) => {
                    loadOptions({ page: 1, pageSize: Number(event.target.value) }).catch(() =>
                      toastr.error('Gagal memuat price list.'),
                    )
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
              <form className="admin-crud-form" onSubmit={submitOption}>
                <select
                  required
                  value={optionForm.productId}
                  onChange={(event) => setOptionForm((previous) => ({ ...previous, productId: event.target.value }))}
                >
                  <option value="">Pilih Produk</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Option name"
                  required
                  value={optionForm.name}
                  onChange={(event) => setOptionForm((previous) => ({ ...previous, name: event.target.value }))}
                />
                <input
                  placeholder="Server"
                  value={optionForm.serverName}
                  onChange={(event) => setOptionForm((previous) => ({ ...previous, serverName: event.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Guest price"
                  required
                  value={optionForm.guestPrice}
                  onChange={(event) => setOptionForm((previous) => ({ ...previous, guestPrice: event.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Member price"
                  required
                  value={optionForm.memberPrice}
                  onChange={(event) =>
                    setOptionForm((previous) => ({ ...previous, memberPrice: event.target.value }))
                  }
                />
                <input
                  type="number"
                  placeholder="Stock"
                  required
                  value={optionForm.stock}
                  onChange={(event) => setOptionForm((previous) => ({ ...previous, stock: event.target.value }))}
                />
                <button type="submit">{editingOptionId ? 'Simpan Harga' : 'Tambah Harga'}</button>
                {editingOptionId && (
                  <button type="button" className="admin-secondary-button" onClick={cancelEditOption}>
                    Batal Edit
                  </button>
                )}
              </form>

              <div className="admin-list-table">
                {priceOptions.map((option) => (
                  <article key={option.id}>
                    <div>
                      <strong>{option.name}</strong>
                      <small>
                        {option.product.title} - Guest: Rp {option.guestPrice.toLocaleString('id-ID')} - Member: Rp{' '}
                        {option.memberPrice.toLocaleString('id-ID')} - Stok {option.stock}
                      </small>
                    </div>
                    <div className="admin-row-actions">
                      <button type="button" className="admin-edit-button" onClick={() => beginEditOption(option)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => removePriceOption(option.id)}>
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={optionPagination.page <= 1}
                  onClick={() => {
                    loadOptions({ page: Math.max(1, optionPagination.page - 1) }).catch(() =>
                      toastr.error('Gagal memuat price list.'),
                    )
                  }}
                >
                  Prev
                </button>
                <span>
                  Page {optionPagination.page} / {optionPagination.totalPages} ({optionPagination.total} items)
                </span>
                <button
                  type="button"
                  disabled={optionPagination.page >= optionPagination.totalPages}
                  onClick={() => {
                    loadOptions({ page: Math.min(optionPagination.totalPages, optionPagination.page + 1) }).catch(
                      () => toastr.error('Gagal memuat price list.'),
                    )
                  }}
                >
                  Next
                </button>
              </div>
            </section>
          )}

          {activeMenu === 'transactions' && (
            <section>
              <h2>Transaction List</h2>
              <div className="admin-toolbar">
                <input
                  placeholder="Search invoice/customer/whatsapp"
                  value={transactionSearch}
                  onChange={(event) => {
                    onTransactionSearchChange(event.target.value).catch(() =>
                      toastr.error('Gagal memuat transaction list.'),
                    )
                  }}
                />
                <select
                  value={transactionStatusFilter}
                  onChange={(event) => {
                    onTransactionStatusChange(event.target.value).catch(() =>
                      toastr.error('Gagal memuat transaction list.'),
                    )
                  }}
                >
                  <option value="">All order status</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <select
                  value={transactionPaymentFilter}
                  onChange={(event) => {
                    onTransactionPaymentChange(event.target.value).catch(() =>
                      toastr.error('Gagal memuat transaction list.'),
                    )
                  }}
                >
                  <option value="">All payment status</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="WAITING">WAITING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
                <select
                  value={String(transactionPagination.pageSize)}
                  onChange={(event) => {
                    loadTransactions({ page: 1, pageSize: Number(event.target.value) }).catch(() =>
                      toastr.error('Gagal memuat transaction list.'),
                    )
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
              <form className="admin-crud-form" onSubmit={submitTransaction}>
                <input
                  placeholder="Invoice code"
                  required
                  value={transactionForm.invoiceCode}
                  onChange={(event) =>
                    setTransactionForm((previous) => ({ ...previous, invoiceCode: event.target.value }))
                  }
                />
                <input
                  placeholder="Customer name"
                  value={transactionForm.customerName}
                  onChange={(event) =>
                    setTransactionForm((previous) => ({ ...previous, customerName: event.target.value }))
                  }
                />
                <input
                  placeholder="WhatsApp"
                  required
                  value={transactionForm.customerWhatsapp}
                  onChange={(event) =>
                    setTransactionForm((previous) => ({ ...previous, customerWhatsapp: event.target.value }))
                  }
                />
                <input
                  type="number"
                  placeholder="Subtotal"
                  required
                  value={transactionForm.subtotal}
                  onChange={(event) =>
                    setTransactionForm((previous) => ({ ...previous, subtotal: event.target.value }))
                  }
                />
                <input
                  type="number"
                  placeholder="Total"
                  required
                  value={transactionForm.total}
                  onChange={(event) => setTransactionForm((previous) => ({ ...previous, total: event.target.value }))}
                />
                <select
                  value={transactionForm.status}
                  onChange={(event) => setTransactionForm((previous) => ({ ...previous, status: event.target.value }))}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <select
                  value={transactionForm.paymentStatus}
                  onChange={(event) =>
                    setTransactionForm((previous) => ({ ...previous, paymentStatus: event.target.value }))
                  }
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="WAITING">WAITING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
                <button type="submit">{editingTransactionId ? 'Simpan Transaksi' : 'Tambah Transaksi'}</button>
                {editingTransactionId && (
                  <button type="button" className="admin-secondary-button" onClick={cancelEditTransaction}>
                    Batal Edit
                  </button>
                )}
              </form>

              <div className="admin-list-table">
                {transactions.map((transaction) => (
                  <article key={transaction.id}>
                    <div>
                      <strong>{transaction.invoiceCode}</strong>
                      <small>
                        {transaction.customerWhatsapp} - {transaction.status} - {transaction.paymentStatus} - Rp{' '}
                        {transaction.total.toLocaleString('id-ID')}
                      </small>
                    </div>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => beginEditTransaction(transaction)}
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => removeTransaction(transaction.id)}>
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={transactionPagination.page <= 1}
                  onClick={() => {
                    loadTransactions({ page: Math.max(1, transactionPagination.page - 1) }).catch(() =>
                      toastr.error('Gagal memuat transaction list.'),
                    )
                  }}
                >
                  Prev
                </button>
                <span>
                  Page {transactionPagination.page} / {transactionPagination.totalPages} (
                  {transactionPagination.total} items)
                </span>
                <button
                  type="button"
                  disabled={transactionPagination.page >= transactionPagination.totalPages}
                  onClick={() => {
                    loadTransactions({
                      page: Math.min(transactionPagination.totalPages, transactionPagination.page + 1),
                    }).catch(() => toastr.error('Gagal memuat transaction list.'))
                  }}
                >
                  Next
                </button>
              </div>
            </section>
          )}
          </section>
        </div>
      </div>
    </main>
  )
}
