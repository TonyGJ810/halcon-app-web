'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatusResult } from '@/types/database'

const STATUS_LABELS: Record<string, string> = {
  'Ordered': 'Ordenado',
  'In process': 'En proceso',
  'In route': 'En ruta',
  'Delivered': 'Entregado',
}

export function OrderLookupForm() {
  const [clientNumber, setClientNumber] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OrderStatusResult[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResults([])
    if (!clientNumber.trim() || !invoiceNumber.trim()) {
      setError('Ingresa número de cliente y factura')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: rpcError } = await supabase.rpc('get_order_status', {
        p_client_number: clientNumber.trim(),
        p_invoice_number: invoiceNumber.trim(),
      })
      if (rpcError) {
        setError(rpcError.message)
        return
      }
      if (!data || data.length === 0) {
        setError('No se encontró ningún pedido con esos datos')
        return
      }
      setResults(data as OrderStatusResult[])
    } finally {
      setLoading(false)
    }
  }

  const status = results[0]?.status
  const deliveredPhoto = results.find((r) => r.photo_url && r.status === 'Delivered')

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="client" className="mb-2 block text-sm font-medium text-slate-700">
            Número de cliente
          </label>
          <input
            id="client"
            type="text"
            value={clientNumber}
            onChange={(e) => setClientNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            placeholder="Ej: 12345"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="invoice" className="mb-2 block text-sm font-medium text-slate-700">
            Número de factura
          </label>
          <input
            id="invoice"
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            placeholder="Ej: FAC-001"
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Consultar estado'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-600">Estado del pedido</p>
          <p className="mb-4 text-xl font-semibold text-slate-800">
            {STATUS_LABELS[status] ?? status}
          </p>
          {deliveredPhoto?.photo_url && status === 'Delivered' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Evidencia de entrega</p>
              <img
                src={deliveredPhoto.photo_url}
                alt="Evidencia de entrega"
                className="max-h-64 w-full rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
