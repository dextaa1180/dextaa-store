import { ArrowRight, Bell, LayoutGrid, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import toastr from 'toastr'
import { navigation } from '../data/storeData'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-top">
        <a className="brand" href="/#top" aria-label="Dextaa Store home">
          <span className="brand-mark">
            <Sparkles size={22} strokeWidth={2.4} />
          </span>
          <span>
            <strong>DextaaStore</strong>
            <small>Game services hub</small>
          </span>
        </a>

        <form
          className="navbar-search"
          role="search"
          aria-label="Cari layanan"
          onSubmit={(event) => {
            event.preventDefault()
            toastr.info('Pencarian frontend siap disambungkan ke katalog backend.')
          }}
        >
          <Search size={18} />
          <input placeholder="Cari game, voucher, atau layanan..." />
        </form>

        <div className="header-actions">
          <div className="nav-menu">
            <button
              className="menu-trigger"
              type="button"
              aria-label="Buka navigasi"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
            >
              <LayoutGrid size={20} />
            </button>
            {menuOpen && (
              <nav className="dropdown-nav" aria-label="Navigasi utama">
                {navigation.map(({ label, href, icon: Icon }) => (
                  <a href={href} key={label} onClick={() => setMenuOpen(false)}>
                    <Icon size={18} />
                    <span>{label}</span>
                    <ArrowRight size={16} />
                  </a>
                ))}
              </nav>
            )}
          </div>
          <button className="icon-button" aria-label="Notifikasi" type="button">
            <Bell size={18} />
          </button>
          <a className="ghost-button" href="/login">
            Masuk
          </a>
          <a className="primary-button" href="/register">
            Daftar
          </a>
        </div>
      </div>
    </header>
  )
}
