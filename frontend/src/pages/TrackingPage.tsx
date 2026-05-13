import { Clock3, ReceiptText, Search, ShieldCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import toastr from 'toastr'

export function TrackingPage() {
  const [invoice, setInvoice] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!invoice.trim()) {
      toastr.warning('Masukkan kode invoice atau nomor pesanan.')
      return
    }

    toastr.info('Fitur pelacakan siap disambungkan ke database transaksi.')
  }

  return (
    <main className="tracking-main">
      <section className="tracking-hero section-surface" aria-labelledby="tracking-title">
        <span className="tracking-kicker">
          <ReceiptText size={17} />
          Lacak Pesanan
        </span>
        <h1 id="tracking-title">Cek Status Pesanan Kamu</h1>
        <p>
          Masukkan invoice atau kode transaksi untuk melihat progres pesanan. Nanti form ini akan membaca data langsung dari
          database transaksi pembeli.
        </p>

        <form className="tracking-search" onSubmit={handleSubmit}>
          <Search size={19} />
          <input
            aria-label="Kode invoice atau nomor pesanan"
            placeholder="Contoh: DXT-849201 atau RKS123456"
            value={invoice}
            onChange={(event) => setInvoice(event.target.value)}
          />
          <button type="submit">Cari</button>
        </form>
      </section>

      <section className="tracking-info-grid section-surface" aria-label="Informasi pelacakan">
        <article>
          <Clock3 size={22} />
          <h2>Update real-time</h2>
          <p>Status order akan mengikuti data pembayaran, proses otomatis, dan catatan admin.</p>
        </article>
        <article>
          <ShieldCheck size={22} />
          <h2>Aman untuk pembeli</h2>
          <p>Pembeli cukup memasukkan kode order tanpa membuka data pribadi di halaman publik.</p>
        </article>
      </section>

    </main>
  )
}
