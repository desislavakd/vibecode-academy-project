'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

interface HeaderProps {
  isLoggedIn?: boolean
}

export default function Header({ isLoggedIn = false }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push('/login')
    }
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <span className="logo-hex">
            <span className="hex-row">⬢⬢</span>
            <span className="hex-row hex-row-offset">⬢⬢</span>
          </span>
          ToolHive
        </Link>

        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard/tools" className="btn btn-primary">
                AI Инструменти
              </Link>
              <button onClick={handleLogout} className="btn btn-primary">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
