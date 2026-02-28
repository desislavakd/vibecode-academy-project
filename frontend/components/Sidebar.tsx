'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logout, getUser } from '@/lib/auth'
import { getTools } from '@/lib/tools'

const HouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/>
  </svg>
)

const baseNavItems = [
  { href: '/dashboard',          label: 'Dashboard',       icon: <HouseIcon /> },
  { href: '/dashboard/tools',    label: 'AI Инструменти', icon: '🔧' },
]

const adminNavItem    = { href: '/dashboard/admin',       label: 'Admin Panel', icon: <ShieldIcon /> }
const auditNavItem    = { href: '/dashboard/admin/audit', label: 'Audit Log',   icon: <ClockIcon />  }

const settingsNavItem = { href: '/dashboard/settings', label: 'Настройки', icon: <GearIcon /> }

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [isOwner, setIsOwner]       = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    getUser().then(user => {
      if (user.role === 'owner') {
        setIsOwner(true)
        getTools({ status: 'pending' })
          .then(res => setPendingCount(res.meta.total))
          .catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const navItems = isOwner
    ? [...baseNavItems, adminNavItem, auditNavItem, settingsNavItem]
    : [...baseNavItems, settingsNavItem]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (pathname !== href && !pathname.startsWith(href + '/')) return false
    // Don't activate a parent if a more specific child nav item also matches
    return !navItems.some(
      item =>
        item.href !== href &&
        item.href.length > href.length &&
        item.href.startsWith(href) &&
        (pathname === item.href || pathname.startsWith(item.href + '/'))
    )
  }

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
            {item.href === '/dashboard/admin' && pendingCount > 0 && (
              <span className="sidebar-badge">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
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
