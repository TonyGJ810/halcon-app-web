import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { UpdateOrderDetailsForm } from '@/components/dashboard/UpdateOrderDetailsForm'
import Link from 'next/link'

/** Pedidos en papelera (borrado lógico): solo Admin puede editar. Sin subida de evidencias. */
export default async function TrashOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
    redirect('/dashboard/restore')
  }

  const { data: order } = await adminClient
    .from('orders')
    .select(
      'id, client_number, invoice_number, client_legal_name, fiscal_data, delivery_address, notes, loading_unit, status, current_process_name, process_updated_at, created_at, deleted_at'
    )
    .eq('id', id)
    .not('deleted_at', 'is', null)
    .single()

  if (!order) notFound()

  const { data: evidence } = await adminClient
    .from('evidence')
    .select('id, photo_url, evidence_type, created_at')
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  const canEditFields = true
  const canEditProcess = true

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/restore" className="mb-4 inline-block text-amber-600 hover:underline">
        ← Volver a papelera
      </Link>
      <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Este pedido está eliminado (papelera). Puedes corregir datos o restaurarlo desde la lista de papelera.
      </p>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Pedido {order.client_number} / {order.invoice_number}
      </h1>
      <p className="mb-1 text-slate-600">
        <span className="font-medium text-slate-700">{order.client_legal_name}</span>
      </p>
      <p className="mb-2 text-sm text-slate-600">{order.delivery_address}</p>
      <p className="mb-2 text-slate-600">Estado: {order.status}</p>
      {order.status === 'In process' && (
        <div className="mb-6 text-sm text-slate-600">
          <p>
            Proceso: {order.current_process_name ?? '—'}
            {order.process_updated_at && (
              <span className="ml-2">({new Date(order.process_updated_at).toLocaleString('es')})</span>
            )}
          </p>
        </div>
      )}
      {(order.fiscal_data || order.notes) && (
        <div className="mb-6 space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          {order.fiscal_data ? (
            <p>
              <span className="font-medium">Fiscal: </span>
              {order.fiscal_data}
            </p>
          ) : null}
          {order.notes ? (
            <p>
              <span className="font-medium">Notas: </span>
              {order.notes}
            </p>
          ) : null}
        </div>
      )}
      {order.loading_unit ? (
        <p className="mb-4 text-sm text-slate-600">
          <span className="font-medium">Unidad / vehículo: </span>
          {order.loading_unit}
        </p>
      ) : null}
      <UpdateOrderDetailsForm
        orderId={order.id}
        clientNumber={order.client_number}
        invoiceNumber={order.invoice_number}
        clientLegalName={order.client_legal_name}
        fiscalData={order.fiscal_data}
        deliveryAddress={order.delivery_address}
        notes={order.notes}
        loadingUnit={order.loading_unit}
        status={order.status}
        currentProcessName={order.current_process_name}
        canEditFields={canEditFields}
        canEditProcess={canEditProcess}
      />
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
