'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  'Ordered': 'Ordenado',
  'In process': 'En proceso',
  'In route': 'En ruta',
  'Delivered': 'Entregado',
}

type OrderRow = {
  id: string
  client_number: string
  invoice_number: string
  status: string
  deleted_at: string
}

export function RestoreList({ orders }: { orders: OrderRow[] }) {
  const [restoring, setRestoring] = useState<string | null>(null)

  async function handleRestore(orderId: string) {
    setRestoring(orderId)
    try {
      const res = await fetch('/api/orders/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'No se pudo restaurar el pedido')
        return
      }
      toast.success('Pedido restaurado')
      window.location.reload()
    } finally {
      setRestoring(null)
    }
  }

  if (orders.length === 0) {
    return <p className="text-slate-600">No hay pedidos eliminados.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-700">Cliente</th>
            <th className="px-4 py-3 font-medium text-slate-700">Factura</th>
            <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
            <th className="px-4 py-3 font-medium text-slate-700">Eliminado</th>
            <th className="px-4 py-3 font-medium text-slate-700">Acción</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-slate-100">
              <td className="px-4 py-3">{o.client_number}</td>
              <td className="px-4 py-3">{o.invoice_number}</td>
              <td className="px-4 py-3">{STATUS_LABELS[o.status] ?? o.status}</td>
              <td className="px-4 py-3">{new Date(o.deleted_at).toLocaleString('es')}</td>
              <td className="px-4 py-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleRestore(o.id)}
                  disabled={restoring === o.id}
                  className="text-amber-600 hover:underline disabled:opacity-50"
                >
                  {restoring === o.id ? 'Restaurando...' : 'Restaurar'}
                </button>
                <Link href={`/dashboard/orders/trash/${o.id}`} className="text-slate-700 hover:underline">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
