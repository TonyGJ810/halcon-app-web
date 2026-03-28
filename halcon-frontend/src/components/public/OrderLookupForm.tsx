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
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [clientNumber, setClientNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OrderStatusResult[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResults([])
    if (!invoiceNumber.trim()) {
      setError('Ingresa el número de factura')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: rpcError } = await supabase.rpc('get_order_status', {
        p_invoice_number: invoiceNumber.trim(),
        p_client_number: clientNumber.trim() || null,
      })
      if (rpcError) {
        setError(rpcError.message)
        return
      }
      const rows = (data ?? []) as OrderStatusResult[]
      if (rows.length === 0) {
        setError('No se encontró ningún pedido con esos datos')
        return
      }
      if (rows.length > 1 && !clientNumber.trim()) {
        setError('Hay varios pedidos con esa factura. Indica también el número de cliente.')
        return
      }
      setResults(rows)
    } finally {
      setLoading(false)
    }
  }

  const row = results[0]
  const status = row?.status
  const deliveredPhoto = status === 'Delivered' ? row?.photo_url : null
  const processName = status === 'In process' ? row?.current_process_name : null
  const processDate = status === 'In process' ? row?.process_updated_at : null

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            required
          />
        </div>
        <div>
          <label htmlFor="client" className="mb-2 block text-sm font-medium text-slate-700">
            Número de cliente <span className="font-normal text-slate-500">(opcional si la factura es única)</span>
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

      {results.length > 0 && row && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-600">Estado del pedido</p>
          <p className="mb-4 text-xl font-semibold text-slate-800">
            {STATUS_LABELS[status] ?? status}
          </p>
          {status === 'In process' && (
            <div className="mb-4 space-y-1 border-t border-slate-100 pt-4 text-sm text-slate-700">
              <p>
                <span className="font-medium">Proceso: </span>
                {processName ?? '—'}
              </p>
              {processDate && (
                <p>
                  <span className="font-medium">Fecha: </span>
                  {new Date(processDate).toLocaleString('es')}
                </p>
              )}
            </div>
          )}
          {deliveredPhoto && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Evidencia de entrega</p>
              <img
                src={deliveredPhoto}
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
