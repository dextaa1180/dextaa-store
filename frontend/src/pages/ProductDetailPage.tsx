import { ArrowRight, CheckCircle2, ChevronLeft, Minus, Plus } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import toastr from 'toastr'
import { paymentGroups, warranties } from '../data/storeData'
import type { Product, ProductOption } from '../types/store'
import { buildProductOptions, formatCurrency } from '../utils/pricing'

type ProductDetailPageProps = {
  onBackHome: () => void
  product: Product
}

export function ProductDetailPage({ product, onBackHome }: ProductDetailPageProps) {
  const options = useMemo(() => buildProductOptions(product), [product])
  const [selectedOption, setSelectedOption] = useState(0)
  const [selectedWarranty, setSelectedWarranty] = useState(warranties[0])
  const [quantity, setQuantity] = useState(1)
  const [openPaymentGroup, setOpenPaymentGroup] = useState(paymentGroups[0].id)
  const [selectedPayment, setSelectedPayment] = useState(paymentGroups[0].channels[0].name)
  const [contact, setContact] = useState('')

  const option = options[selectedOption]
  const total = option.price * quantity

  const groupedOptions = useMemo(() => {
    return options.reduce<Record<string, ProductOption[]>>((groups, item) => {
      groups[item.server] = [...(groups[item.server] ?? []), item]
      return groups
    }, {})
  }, [options])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contact.trim()) {
      toastr.warning('Masukkan nomor WhatsApp dulu.')
      return
    }
    toastr.success(`${product.title} siap dikonfirmasi. Total ${formatCurrency(total)}.`)
  }

  return (
    <main className="detail-main">
      <button className="breadcrumb-button" type="button" onClick={onBackHome}>
        <ChevronLeft size={18} />
        Kembali ke katalog
      </button>

      <section className="detail-hero section-surface" aria-label={`Detail ${product.title}`}>
        <div className="detail-media">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="detail-summary">
          <span className="product-badge">{product.category}</span>
          <h1>{product.title}</h1>
          <strong>{product.publisher}</strong>
          <p>{product.description}</p>
          <div className="detail-tags" aria-label="Fitur produk">
            {product.supports.map((support) => (
              <span key={support}>
                <CheckCircle2 size={15} />
                {support}
              </span>
            ))}
          </div>
        </div>
      </section>

      <form className="detail-layout" onSubmit={handleSubmit}>
        <section className="detail-panel option-panel" aria-labelledby="nominal-title">
          <div className="detail-panel-heading">
            <span>1</span>
            <h2 id="nominal-title">Pilih Nominal</h2>
          </div>
          {Object.entries(groupedOptions).map(([server, items]) => (
            <div className="option-group" key={server}>
              <h3>{server}</h3>
              <div className="option-grid">
                {items.map((item) => {
                  const index = options.indexOf(item)
                  return (
                    <button
                      className={index === selectedOption ? 'option-card is-selected' : 'option-card'}
                      key={`${item.server}-${item.name}`}
                      type="button"
                      onClick={() => setSelectedOption(index)}
                    >
                      <span>{item.perk}</span>
                      <strong>{item.name}</strong>
                      <small>{formatCurrency(item.price)}</small>
                      <em>Ready {item.stock} Stock</em>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        <aside className="checkout-stack" aria-label="Checkout produk">
          <section className="detail-panel">
            <div className="detail-panel-heading">
              <span>2</span>
              <h2>Pilih Jangka Garansi</h2>
            </div>
            <div className="segmented-options">
              {warranties.map((warranty) => (
                <button
                  className={warranty === selectedWarranty ? 'is-selected' : ''}
                  key={warranty}
                  type="button"
                  onClick={() => setSelectedWarranty(warranty)}
                >
                  {warranty}
                </button>
              ))}
            </div>
          </section>

          <section className="detail-panel">
            <div className="detail-panel-heading">
              <span>3</span>
              <h2>Jumlah Order</h2>
            </div>
            <div className="quantity-control">
              <button
                aria-label="Kurangi jumlah"
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus size={16} />
              </button>
              <strong>{quantity}</strong>
              <button aria-label="Tambah jumlah" type="button" onClick={() => setQuantity((value) => value + 1)}>
                <Plus size={16} />
              </button>
            </div>
          </section>

          <section className="promo-strip">
            <span>4. Punya Kode Promo?</span>
            <ArrowRight size={18} />
          </section>

          <section className="detail-panel">
            <div className="detail-panel-heading">
              <span>5</span>
              <h2>Pilih Metode Pembayaran</h2>
            </div>
            <div className="payment-choice-list">
              {paymentGroups.map((group) => (
                <div className={openPaymentGroup === group.id ? 'payment-group is-open' : 'payment-group'} key={group.id}>
                  <button
                    aria-expanded={openPaymentGroup === group.id}
                    className="payment-group-trigger"
                    type="button"
                    onClick={() => setOpenPaymentGroup((current) => (current === group.id ? '' : group.id))}
                  >
                    <span>{group.id}</span>
                    <small className="payment-logo-strip" aria-label={`${group.id} tersedia`}>
                      {group.channels.slice(0, 3).map((channel) => (
                        <img src={channel.logo} alt={channel.name} key={channel.name} />
                      ))}
                    </small>
                    <ArrowRight size={15} />
                  </button>

                  {openPaymentGroup === group.id && (
                    <div className="payment-channel-list">
                      {group.channels.map((channel) => (
                        <button
                          className={channel.name === selectedPayment ? 'is-selected' : ''}
                          key={channel.name}
                          type="button"
                          onClick={() => setSelectedPayment(channel.name)}
                        >
                          <span className="radio-dot" aria-hidden="true" />
                          <strong>{channel.name}</strong>
                          <img src={channel.logo} alt={channel.name} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="detail-panel">
            <div className="detail-panel-heading">
              <span>6</span>
              <h2>Detail Kontak</h2>
            </div>
            <label className="contact-field">
              <span>No. WhatsApp</span>
              <input
                inputMode="tel"
                onChange={(event) => setContact(event.target.value)}
                placeholder="08xxxx"
                value={contact}
              />
            </label>
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button className="confirm-button" type="submit">
              Konfirmasi Pesanan
            </button>
          </section>
        </aside>
      </form>
    </main>
  )
}
