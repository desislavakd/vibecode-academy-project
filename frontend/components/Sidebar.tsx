'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

const HouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)

const navItems = [
  { href: '/dashboard',       label: 'Dashboard',       icon: <HouseIcon /> },
  { href: '/dashboard/tools', label: 'AI Инструменти', icon: '🔧' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push('/login')
    }
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item${isActive(item.href) ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={handleLogout}>
          <span className="sidebar-icon">⎋</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
