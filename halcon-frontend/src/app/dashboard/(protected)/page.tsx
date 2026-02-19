import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/orders"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow"
        >
          <h2 className="font-semibold text-slate-800">Pedidos</h2>
          <p className="mt-1 text-sm text-slate-600">
            Crear, buscar y gestionar pedidos
          </p>
        </Link>
        <Link
          href="/dashboard/users"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow"
        >
          <h2 className="font-semibold text-slate-800">Usuarios</h2>
          <p className="mt-1 text-sm text-slate-600">
            Crear usuarios y asignar roles
          </p>
        </Link>
        <Link
          href="/dashboard/restore"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow"
        >
          <h2 className="font-semibold text-slate-800">Restaurar</h2>
          <p className="mt-1 text-sm text-slate-600">
            Restaurar pedidos eliminados
          </p>
        </Link>
      </div>
    </div>
  )
}
