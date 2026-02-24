import { redirect } from 'next/navigation'

// Root redirect: go to /dashboard (server will handle unauth → /login)
export default function HomePage() {
  redirect('/dashboard')
}
