import { AtSign, ExternalLink, MessageCircle, Sparkles } from 'lucide-react'
import { footerLinks, footerPaymentLogos } from '../data/storeData'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <a className="footer-brand" href="/#top" aria-label="Dextaa Store home">
            <span className="brand-mark">
              <Sparkles size={22} strokeWidth={2.4} />
            </span>
            <strong>DextaaStore</strong>
          </a>
          <p>
            DextaaStore: pusat top up, joki, dan akun game dengan layanan cepat,
            katalog rapi, serta checkout yang siap dikembangkan ke backend.
          </p>

          <div className="footer-payments" aria-label="Pembayaran tersedia">
            <h2>Pembayaran Tersedia</h2>
            <div>
              {footerPaymentLogos.map((payment) => (
                <img src={payment.logo} alt={payment.name} key={payment.name} />
              ))}
              <span>+12 lainnya</span>
            </div>
          </div>
        </div>

        <nav className="footer-info" aria-label="Informasi footer">
          <h2>Informasi</h2>
          {footerLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer-social">
          <h2>Ikuti Kami</h2>
          <div className="social-links" aria-label="Media sosial DextaaStore">
            <a href="https://discord.com/" aria-label="Discord DextaaStore">
              <MessageCircle size={18} />
            </a>
            <a href="https://instagram.com/" aria-label="Instagram DextaaStore">
              <AtSign size={18} />
            </a>
            <a href="https://facebook.com/" aria-label="Facebook DextaaStore">
              <span>f</span>
            </a>
          </div>

          <a className="footer-app-card" href="/#top">
            <span>
              <strong>Akses melalui aplikasi DextaaStore</strong>
              <small>Dapatkan aplikasi sekarang</small>
            </span>
            <ExternalLink size={20} />
          </a>
        </div>
      </div>

      <div className="footer-bottom">Copyright © 2026 DextaaStore. Semua hak cipta dilindungi.</div>
    </footer>
  )
}
