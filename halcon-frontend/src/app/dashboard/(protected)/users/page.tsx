import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersList } from '@/components/dashboard/UsersList'
import { CreateUserForm } from '@/components/dashboard/CreateUserForm'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/login')

  let adminClient
  try {
    adminClient = (await import('@/lib/supabase/admin')).createAdminClient()
  } catch {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-amber-600">Configura SUPABASE_SERVICE_ROLE_KEY en .env.local</p>
      </div>
    )
  }
  const { data: profile } = await adminClient
    .from('users')
    .select('*, roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  const isAdmin = roleName === 'Admin'

  const { data: users } = await adminClient
    .from('users')
    .select('id, email, full_name, role_id, roles(id, name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: roles } = await adminClient.from('roles').select('id, name').order('name')

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Usuarios</h1>
      {isAdmin ? (
        <>
          <CreateUserForm roles={roles ?? []} />
          <UsersList users={users ?? []} roles={roles ?? []} />
        </>
      ) : (
        <p className="text-slate-600">No tienes permisos para gestionar usuarios.</p>
      )}
    </div>
  )
}
