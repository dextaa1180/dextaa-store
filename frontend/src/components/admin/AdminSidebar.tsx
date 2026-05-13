import { LogOut, type LucideIcon } from 'lucide-react'

export type AdminSidebarMenu<TKey extends string = string> = {
  key: TKey
  label: string
  icon: LucideIcon
}

type AdminSidebarProps<TKey extends string> = {
  adminName: string
  activeMenu: TKey
  menus: readonly AdminSidebarMenu<TKey>[]
  onSelectMenu: (key: TKey) => void
  onLogout: () => void
}

export function AdminSidebar<TKey extends string>({
  adminName,
  activeMenu,
  menus,
  onSelectMenu,
  onLogout,
}: AdminSidebarProps<TKey>) {
  return (
    <aside className="admin-sidebar-panel section-surface" aria-label="Dashboard navigation">
      <div className="admin-sidebar-branding">
        <span className="admin-sidebar-eyebrow">Assistant</span>
        <strong>DextaaStore Admin</strong>
        <p>Logged in as {adminName}</p>
      </div>

      <nav className="admin-sidebar" aria-label="Admin menu">
        {menus.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={activeMenu === key ? 'is-active' : ''}
            type="button"
            onClick={() => onSelectMenu(key)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button className="admin-sidebar-logout" type="button" onClick={onLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  )
}
