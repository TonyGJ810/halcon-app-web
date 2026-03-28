'use client'

import { useState } from 'react'

export function CreateUserForm({
  roles,
  departments,
}: {
  roles: { id: string; name: string }[]
  departments: { id: string; name: string }[]
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '')
  const [departmentId, setDepartmentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          roleId,
          departmentId: departmentId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al crear usuario')
        return
      }
      setSuccess(true)
      setEmail('')
      setPassword('')
      setFullName('')
      setRoleId(roles[0]?.id ?? '')
      setDepartmentId('')
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-800">Crear usuario</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Departamento</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">— Ninguno —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">Usuario creado correctamente.</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  )
}
