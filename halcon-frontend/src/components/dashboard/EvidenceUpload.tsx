'use client'

import { useState, useRef } from 'react'

const EVIDENCE_TYPES = [
  { value: 'loading', label: 'Carga' },
  { value: 'unloading', label: 'Descarga' },
  { value: 'delivery', label: 'Entrega' },
] as const

export function EvidenceUpload({ orderId, userId }: { orderId: string; userId: string }) {
  const [evidenceType, setEvidenceType] = useState<'loading' | 'unloading' | 'delivery'>('delivery')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Selecciona una imagen')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', orderId)
      formData.append('evidenceType', evidenceType)
      formData.append('userId', userId)

      const res = await fetch('/api/evidence', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al subir')
        return
      }
      if (fileRef.current) fileRef.current.value = ''
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-800">Subir evidencia</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
          <select
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value as 'loading' | 'unloading' | 'delivery')}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Foto</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Subiendo...' : 'Subir'}
      </button>
    </form>
  )
}
