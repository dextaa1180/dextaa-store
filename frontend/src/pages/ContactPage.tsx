import { MessageSquareText, Send, ShieldCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import toastr from 'toastr'

const formTypes = ['Individu', 'Perusahaan', 'Partner']
const requestTypes = ['Masalah Akun', 'Laporan Pesanan', 'Permintaan Produk', 'Kerja Sama', 'Lainnya']

export function ContactPage() {
  const [formType, setFormType] = useState(formTypes[0])
  const [requestType, setRequestType] = useState(requestTypes[0])
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !whatsapp.trim() || !message.trim()) {
      toastr.warning('Lengkapi nama, nomor WhatsApp, dan pesan terlebih dahulu.')
      return
    }

    toastr.success('Pesan berhasil disiapkan. Form ini siap disambungkan ke database laporan.')
    setName('')
    setWhatsapp('')
    setMessage('')
  }

  return (
    <main className="contact-main">
      <section className="contact-hero section-surface" aria-labelledby="contact-title">
        <span className="contact-kicker">
          <MessageSquareText size={17} />
          Hubungi Kami
        </span>
        <h1 id="contact-title">Formulir Laporan / Permintaan</h1>
        <p>Kirim laporan, pertanyaan, atau permintaan layanan. Tim DextaaStore akan menindaklanjuti melalui WhatsApp.</p>
      </section>

      <section className="contact-form-panel section-surface" aria-label="Formulir laporan dan permintaan">
        <form className="support-form" onSubmit={handleSubmit}>
          <label>
            <span>Type Form</span>
            <select value={formType} onChange={(event) => setFormType(event.target.value)}>
              {formTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Type</span>
            <select value={requestType} onChange={(event) => setRequestType(event.target.value)}>
              {requestTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Nama Lengkap</span>
            <input
              placeholder="Masukkan nama anda"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label>
            <span>No. WhatsApp</span>
            <input
              inputMode="tel"
              placeholder="08xxxx"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
            />
          </label>

          <label>
            <span>Pesan</span>
            <textarea
              placeholder="Tulis pesan anda"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <button type="submit">
            <Send size={18} />
            Kirim Pesan
          </button>
        </form>

        <aside className="contact-side-note" aria-label="Informasi keamanan formulir">
          <ShieldCheck size={26} />
          <h2>Data aman untuk tindak lanjut</h2>
          <p>Form ini hanya meminta kontak dan isi pesan yang dibutuhkan agar laporan bisa diproses dengan jelas.</p>
        </aside>
      </section>
    </main>
  )
}
