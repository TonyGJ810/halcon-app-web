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
  client_legal_name: string
  status: string
  created_at: string
}

function parseLocalDate(value: string): Date | null {
  if (!value.trim()) return null
  const d = new Date(value + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

export function OrdersList({
  orders,
  canUpdate,
  canDelete,
}: {
  orders: OrderRow[]
  canUpdate: boolean
  canDelete: boolean
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase().trim()
    if (
      q &&
      !o.client_number.toLowerCase().includes(q) &&
      !o.invoice_number.toLowerCase().includes(q) &&
      !(o.client_legal_name ?? '').toLowerCase().includes(q)
    ) {
      return false
    }
    if (statusFilter && o.status !== statusFilter) return false

    const created = new Date(o.created_at)
    const from = parseLocalDate(dateFrom)
    const to = parseLocalDate(dateTo)
    if (from) {
      const start = new Date(from)
      if (created < start) return false
    }
    if (to) {
      const end = new Date(to)
      end.setHours(23, 59, 59, 999)
      if (created > end) return false
    }
    return true
  })

  async function handleStatusChange(orderId: string, status: string) {
    setUpdating(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'No se pudo actualizar el estado')
        return
      }
      toast.success('Estado actualizado')
      window.location.reload()
    } finally {
      setUpdating(null)
    }
  }

  async function handleSoftDelete(orderId: string) {
    if (!confirm('¿Eliminar este pedido?')) return
    setUpdating(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? 'No se pudo eliminar el pedido')
        return
      }
      toast.success('Pedido enviado a la papelera')
      window.location.reload()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cliente, factura o razón social"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Todos</option>
            <option value="Ordered">{STATUS_LABELS['Ordered']}</option>
            <option value="In process">{STATUS_LABELS['In process']}</option>
            <option value="In route">{STATUS_LABELS['In route']}</option>
            <option value="Delivered">{STATUS_LABELS['Delivered']}</option>
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-slate-700">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-slate-700">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Cliente</th>
              <th className="px-4 py-3 font-medium text-slate-700">Factura</th>
              <th className="px-4 py-3 font-medium text-slate-700">Razón social</th>
              <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
              <th className="px-4 py-3 font-medium text-slate-700">Creado</th>
              <th className="px-4 py-3 font-medium text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{o.client_number}</td>
                <td className="px-4 py-3">{o.invoice_number}</td>
                <td className="max-w-[200px] truncate px-4 py-3" title={o.client_legal_name}>
                  {o.client_legal_name || '—'}
                </td>
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
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <Link href={`/dashboard/orders/${o.id}`} className="text-amber-600 hover:underline">
                    Ver
                  </Link>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleSoftDelete(o.id)}
                      disabled={updating === o.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
