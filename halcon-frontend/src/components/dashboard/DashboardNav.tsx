'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/dashboard/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/orders', label: 'Pedidos' },
    { href: '/dashboard/users', label: 'Usuarios' },
    { href: '/dashboard/restore', label: 'Restaurar' },
  ]

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-amber-600">
            Halcon
          </Link>
          <div className="flex gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
