import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RestoreList } from '@/components/dashboard/RestoreList'

export default async function RestorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/login')

  const adminClient = await import('@/lib/supabase/admin').then((m) => m.createAdminClient())
  const { data: profile } = await adminClient
    .from('users')
    .select('roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  if (roleName !== 'Admin') {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Restaurar pedidos</h1>
        <p className="text-slate-600">Solo el Administrador puede restaurar pedidos eliminados.</p>
      </div>
    )
  }

  const { data: deletedOrders } = await adminClient
    .from('orders')
    .select('id, client_number, invoice_number, status, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Restaurar pedidos</h1>
      <p className="mb-4 text-sm text-slate-600">
        Pedidos eliminados (borrado lógico). Restaura para volver a verlos en la lista activa.
      </p>
      <RestoreList orders={deletedOrders ?? []} />
    </div>
  )
}
