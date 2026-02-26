import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <Link href="/dashboard" className="logo">
          <span className="logo-hex">
            <span className="hex-row">⬢⬢</span>
            <span className="hex-row hex-row-offset">⬢⬢</span>
          </span>
          ToolHive
        </Link>
      </header>
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  )
}
