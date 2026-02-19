import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrdersList } from '@/components/dashboard/OrdersList'
import { CreateOrderForm } from '@/components/dashboard/CreateOrderForm'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/login')

  const adminClient = await import('@/lib/supabase/admin').then((m) => m.createAdminClient())
  const { data: profile } = await adminClient
    .from('users')
    .select('*, roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const { data: appUsers } = await adminClient
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  const canCreate = ['Admin', 'Sales'].includes(roleName)
  const canDelete = roleName === 'Admin'
  const canUpdateStatus = ['Admin', 'Purchasing', 'Warehouse', 'Route'].includes(roleName)
  const canAddEvidence = ['Admin', 'Route', 'Warehouse'].includes(roleName)

  const { data: orders } = await adminClient
    .from('orders')
    .select('id, client_number, invoice_number, status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Pedidos</h1>
      {canCreate && <CreateOrderForm currentUserId={appUsers?.id} />}
      <OrdersList
        orders={orders ?? []}
        canUpdate={canUpdateStatus}
        canDelete={canDelete}
        canAddEvidence={canAddEvidence}
      />
    </div>
  )
}
