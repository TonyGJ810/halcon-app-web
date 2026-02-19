import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EvidenceUpload } from '@/components/dashboard/EvidenceUpload'
import Link from 'next/link'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/login')

  const adminClient = await import('@/lib/supabase/admin').then((m) => m.createAdminClient())
  const { data: profile } = await adminClient
    .from('users')
    .select('id, roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  const canAddEvidence = ['Admin', 'Route', 'Warehouse'].includes(roleName)

  const { data: order } = await adminClient
    .from('orders')
    .select('id, client_number, invoice_number, status, created_at')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!order) notFound()

  const { data: evidence } = await adminClient
    .from('evidence')
    .select('id, photo_url, evidence_type, created_at')
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/orders" className="mb-4 inline-block text-amber-600 hover:underline">
        ← Volver a pedidos
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Pedido {order.client_number} / {order.invoice_number}
      </h1>
      <p className="mb-6 text-slate-600">Estado: {order.status}</p>
      {canAddEvidence && (
        <EvidenceUpload orderId={order.id} userId={profile!.id} />
      )}
      {evidence && evidence.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-semibold text-slate-800">Evidencias</h2>
          <div className="space-y-4">
            {evidence.map((e) => (
              <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm text-slate-600">
                  {e.evidence_type} - {new Date(e.created_at).toLocaleString('es')}
                </p>
                <img
                  src={e.photo_url}
                  alt={`Evidencia ${e.evidence_type}`}
                  className="max-h-48 rounded object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
