'use client'

import { useState } from 'react'

export function UpdateOrderDetailsForm({
  orderId,
  clientNumber,
  invoiceNumber,
  status,
  currentProcessName,
  canEditFields,
  canEditProcess,
}: {
  orderId: string
  clientNumber: string
  invoiceNumber: string
  status: string
  currentProcessName: string | null
  canEditFields: boolean
  canEditProcess: boolean
}) {
  const [client, setClient] = useState(clientNumber)
  const [invoice, setInvoice] = useState(invoiceNumber)
  const [processName, setProcessName] = useState(currentProcessName ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (
      !canEditFields &&
      canEditProcess &&
      status === 'In process' &&
      !processName.trim()
    ) {
      setError('Indica el nombre del proceso')
      return
    }
    setLoading(true)
    try {
      const body: Record<string, string> = { orderId }
      if (canEditFields) {
        body.clientNumber = client
        body.invoiceNumber = invoice
      }
      if (canEditProcess && status === 'In process' && processName.trim()) {
        body.currentProcessName = processName.trim()
      }

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al actualizar')
        return
      }
      setSuccess(true)
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  if (!canEditFields && !(canEditProcess && status === 'In process')) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-800">Actualizar datos del pedido</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {canEditFields && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Número de cliente</label>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Número de factura</label>
              <input
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
          </>
        )}
        {canEditProcess && status === 'In process' && (
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre del proceso actual</label>
            <input
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="Ej: Empaque y revisión"
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">Guardado.</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
