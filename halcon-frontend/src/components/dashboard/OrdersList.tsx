'use client'

import { useState } from 'react'

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
  created_at: string
}

export function OrdersList({
  orders,
  canUpdate,
  canDelete,
  canAddEvidence,
}: {
  orders: OrderRow[]
  canUpdate: boolean
  canDelete: boolean
  canAddEvidence?: boolean
}) {
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = orders.filter(
    (o) =>
      o.client_number.toLowerCase().includes(search.toLowerCase()) ||
      o.invoice_number.toLowerCase().includes(search.toLowerCase())
  )

  async function handleStatusChange(orderId: string, status: string) {
    setUpdating(orderId)
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      window.location.reload()
    } finally {
      setUpdating(null)
    }
  }

  async function handleSoftDelete(orderId: string) {
    if (!confirm('¿Eliminar este pedido?')) return
    setUpdating(orderId)
    try {
      await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      window.location.reload()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Buscar</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cliente o factura"
          className="w-full max-w-xs rounded border border-slate-300 px-3 py-2"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Cliente</th>
              <th className="px-4 py-3 font-medium text-slate-700">Factura</th>
              <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
              <th className="px-4 py-3 font-medium text-slate-700">Creado</th>
              {(canUpdate || canDelete || canAddEvidence) && <th className="px-4 py-3 font-medium text-slate-700">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{o.client_number}</td>
                <td className="px-4 py-3">{o.invoice_number}</td>
                <td className="px-4 py-3">
                  {canUpdate ? (
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={updating === o.id}
                      className="rounded border border-slate-300 px-2 py-1"
                    >
                      <option value="Ordered">{STATUS_LABELS['Ordered']}</option>
                      <option value="In process">{STATUS_LABELS['In process']}</option>
                      <option value="In route">{STATUS_LABELS['In route']}</option>
                      <option value="Delivered">{STATUS_LABELS['Delivered']}</option>
                    </select>
                  ) : (
                    STATUS_LABELS[o.status] ?? o.status
                  )}
                </td>
                <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString('es')}</td>
                {(canUpdate || canDelete || canAddEvidence) && (
                  <td className="px-4 py-3 flex gap-2">
                    {canAddEvidence && (
                      <a href={`/dashboard/orders/${o.id}`} className="text-amber-600 hover:underline">
                        Evidencia
                      </a>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleSoftDelete(o.id)}
                        disabled={updating === o.id}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
