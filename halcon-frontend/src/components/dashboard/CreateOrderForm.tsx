'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function CreateOrderForm({ currentUserId }: { currentUserId?: string }) {
  const [clientNumber, setClientNumber] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [clientLegalName, setClientLegalName] = useState('')
  const [fiscalData, setFiscalData] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientNumber,
          invoiceNumber,
          clientLegalName,
          fiscalData: fiscalData.trim() || null,
          deliveryAddress,
          notes: notes.trim() || null,
          createdBy: currentUserId ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al crear pedido')
        return
      }
      toast.success('Pedido creado correctamente')
      setClientNumber('')
      setInvoiceNumber('')
      setClientLegalName('')
      setFiscalData('')
      setDeliveryAddress('')
      setNotes('')
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-800">Crear pedido</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Número de cliente</label>
          <input
            type="text"
            value={clientNumber}
            onChange={(e) => setClientNumber(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Número de factura</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nombre / Razón social</label>
          <input
            type="text"
            value={clientLegalName}
            onChange={(e) => setClientLegalName(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Datos fiscales</label>
          <textarea
            value={fiscalData}
            onChange={(e) => setFiscalData(e.target.value)}
            rows={2}
            placeholder="RFC, régimen fiscal, etc."
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Dirección de entrega</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Notas adicionales</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear pedido'}
      </button>
    </form>
  )
}
