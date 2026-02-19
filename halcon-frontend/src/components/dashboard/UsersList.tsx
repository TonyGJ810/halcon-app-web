'use client'

import { useState } from 'react'
type UserRow = {
  id: string
  email: string
  full_name: string
  role_id: string
  roles?: { id: string; name: string } | { id: string; name: string }[] | null
}

export function UsersList({ users, roles }: { users: UserRow[]; roles: { id: string; name: string }[] }) {
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleRoleChange(userId: string, roleId: string) {
    setUpdating(userId)
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId }),
      })
      window.location.reload()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-700">Nombre</th>
            <th className="px-4 py-3 font-medium text-slate-700">Email</th>
            <th className="px-4 py-3 font-medium text-slate-700">Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="px-4 py-3">{u.full_name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role_id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={updating === u.id}
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
