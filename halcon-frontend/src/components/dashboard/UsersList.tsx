'use client'

import { useMemo, useState } from 'react'

type UserRow = {
  id: string
  email: string
  full_name: string
  role_id: string
  department_id: string | null
  deleted_at: string | null
  roles?: { id: string; name: string } | { id: string; name: string }[] | null
  departments?: { id: string; name: string } | { id: string; name: string }[] | null
}

type Filter = 'all' | 'active' | 'inactive'

export function UsersList({
  users,
  roles,
  departments,
}: {
  users: UserRow[]
  roles: { id: string; name: string }[]
  departments: { id: string; name: string }[]
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<{
    fullName: string
    email: string
    roleId: string
    departmentId: string
    active: boolean
  } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'active') return users.filter((u) => !u.deleted_at)
    if (filter === 'inactive') return users.filter((u) => u.deleted_at)
    return users
  }, [users, filter])

  function roleLabel(u: UserRow) {
    const r = u.roles
    return (Array.isArray(r) ? r[0] : r)?.name ?? '—'
  }

  function deptLabel(u: UserRow) {
    const d = u.departments
    return (Array.isArray(d) ? d[0] : d)?.name ?? '—'
  }

  function startEdit(u: UserRow) {
    setEditingId(u.id)
    setDraft({
      fullName: u.full_name,
      email: u.email,
      roleId: u.role_id,
      departmentId: u.department_id ?? '',
      active: !u.deleted_at,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
  }

  async function saveEdit(userId: string) {
    if (!draft) return
    setSaving(userId)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fullName: draft.fullName,
          email: draft.email,
          roleId: draft.roleId,
          departmentId: draft.departmentId || null,
          active: draft.active,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? 'Error al guardar')
        return
      }
      cancelEdit()
      window.location.reload()
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-700">Mostrar:</span>
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1 text-sm ${
              filter === f ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Nombre</th>
              <th className="px-4 py-3 font-medium text-slate-700">Email</th>
              <th className="px-4 py-3 font-medium text-slate-700">Rol</th>
              <th className="px-4 py-3 font-medium text-slate-700">Departamento</th>
              <th className="px-4 py-3 font-medium text-slate-700">Estado</th>
              <th className="px-4 py-3 font-medium text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 align-top">
                {editingId === u.id && draft ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        value={draft.fullName}
                        onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                        className="w-full min-w-[8rem] rounded border border-slate-300 px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        className="w-full min-w-[10rem] rounded border border-slate-300 px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={draft.roleId}
                        onChange={(e) => setDraft({ ...draft, roleId: e.target.value })}
                        className="rounded border border-slate-300 px-2 py-1"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={draft.departmentId}
                        onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}
                        className="rounded border border-slate-300 px-2 py-1"
                      >
                        <option value="">—</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={draft.active}
                          onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                        />
                        <span>Activo</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={saving === u.id}
                          onClick={() => saveEdit(u.id)}
                          className="text-left text-amber-600 hover:underline disabled:opacity-50"
                        >
                          {saving === u.id ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" onClick={cancelEdit} className="text-left text-slate-600 hover:underline">
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{u.full_name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{roleLabel(u)}</td>
                    <td className="px-4 py-3">{deptLabel(u)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          u.deleted_at ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {u.deleted_at ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="text-amber-600 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
