'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function UpdateOrderDetailsForm({
  orderId,
  clientNumber,
  invoiceNumber,
  clientLegalName,
  fiscalData,
  deliveryAddress,
  notes,
  loadingUnit,
  status,
  currentProcessName,
  canEditFields,
  canEditProcess,
}: {
  orderId: string
  clientNumber: string
  invoiceNumber: string
  clientLegalName: string
  fiscalData: string | null
  deliveryAddress: string
  notes: string | null
  loadingUnit: string | null
  status: string
  currentProcessName: string | null
  canEditFields: boolean
  canEditProcess: boolean
}) {
  const [client, setClient] = useState(clientNumber)
  const [invoice, setInvoice] = useState(invoiceNumber)
  const [legalName, setLegalName] = useState(clientLegalName)
  const [fiscal, setFiscal] = useState(fiscalData ?? '')
  const [address, setAddress] = useState(deliveryAddress)
  const [notesVal, setNotesVal] = useState(notes ?? '')
  const [unit, setUnit] = useState(loadingUnit ?? '')
  const [processName, setProcessName] = useState(currentProcessName ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !canEditFields &&
      canEditProcess &&
      status === 'In process' &&
      !processName.trim()
    ) {
      toast.error('Indica el nombre del proceso')
      return
    }
    setLoading(true)
    try {
      const body: Record<string, string | undefined> = { orderId }
      if (canEditFields) {
        body.clientNumber = client
        body.invoiceNumber = invoice
        body.clientLegalName = legalName
        body.fiscalData = fiscal.trim() || ''
        body.deliveryAddress = address
        body.notes = notesVal.trim() || ''
        body.loadingUnit = unit.trim() || ''
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
        toast.error(data.error ?? 'Error al actualizar')
        return
      }
      toast.success('Pedido actualizado')
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  const showProcessField = canEditProcess && status === 'In process'
  const showLoadingUnit =
    canEditFields && (status === 'In route' || status === 'Delivered')

  if (!canEditFields && !showProcessField) {
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
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre / Razón social</label>
              <input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Datos fiscales</label>
              <textarea
                value={fiscal}
                onChange={(e) => setFiscal(e.target.value)}
                rows={2}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Dirección de entrega</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={2}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Notas adicionales</label>
              <textarea
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                rows={2}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
          </>
        )}
        {showLoadingUnit && (
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Unidad / vehículo (carga en ruta)
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ej: Unidad 12 · placas XYZ-123"
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
        )}
        {showProcessField && (
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
