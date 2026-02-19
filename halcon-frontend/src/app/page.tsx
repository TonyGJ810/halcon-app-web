import { OrderLookupForm } from '@/components/public/OrderLookupForm'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Halcon</h1>
        <p className="mt-1 text-slate-600">Distribuidora de Materiales de Construcción</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-700">
          Consulta el estado de tu pedido
        </h2>
        <OrderLookupForm />
        <p className="mt-4 text-center">
          <a
            href="/dashboard"
            className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            Acceso empleados
          </a>
        </p>
      </div>
    </main>
  )
}
