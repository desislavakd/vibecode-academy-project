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
          AI Platform
        </Link>

        <nav>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
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
