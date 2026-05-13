import { ArrowRight, Bell, LayoutGrid, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { navigation } from '../data/storeData'

type SiteHeaderProps = {
  onSearch: (query: string) => void
}

export function SiteHeader({ onSearch }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

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

        <button
          className="mobile-menu-trigger"
          type="button"
          aria-label="Buka navigasi"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <LayoutGrid size={20} />
        </button>

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
              <nav className="dropdown-nav desktop-dropdown-nav" aria-label="Navigasi utama">
                <div className="nav-link-list">
                  {navigation.map(({ label, href, icon: Icon }) => (
                    <a href={href} key={label} onClick={() => setMenuOpen(false)}>
                      <Icon size={18} />
                      <span>{label}</span>
                      <ArrowRight size={16} />
                    </a>
                  ))}
                </div>
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

        <form
          className="navbar-search"
          role="search"
          aria-label="Cari layanan"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(search)
          }}
        >
          <Search size={18} />
          <input
            placeholder="Cari game, voucher, atau layanan..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>
      </div>
      {menuOpen && (
        <>
          <button
            className="nav-backdrop"
            type="button"
            aria-label="Tutup navigasi"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="dropdown-nav mobile-drawer-nav" aria-label="Navigasi utama">
            <div className="mobile-nav-title">Navigation</div>
            <div className="nav-link-list">
              {navigation.map(({ label, href, icon: Icon }) => (
                <a href={href} key={label} onClick={() => setMenuOpen(false)}>
                  <Icon size={18} />
                  <span>{label}</span>
                  <ArrowRight size={16} />
                </a>
              ))}
            </div>
            <div className="mobile-nav-auth">
              <a className="ghost-button" href="/login" onClick={() => setMenuOpen(false)}>
                Masuk
              </a>
              <a className="primary-button" href="/register" onClick={() => setMenuOpen(false)}>
                Daftar
              </a>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
