import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const STATUSES = ['Ordered', 'In process', 'In route', 'Delivered'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('users')
    .select('id, roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  if (!['Admin', 'Sales'].includes(roleName)) {
    return NextResponse.json({ error: 'Solo Sales o Admin pueden crear pedidos' }, { status: 403 })
  }

  const body = await request.json()
  const {
    clientNumber,
    invoiceNumber,
    clientLegalName,
    fiscalData,
    deliveryAddress,
    notes,
    createdBy,
  } = body as {
    clientNumber?: string
    invoiceNumber?: string
    clientLegalName?: string
    fiscalData?: string | null
    deliveryAddress?: string
    notes?: string | null
    createdBy?: string | null
  }

  if (!clientNumber?.trim() || !invoiceNumber?.trim()) {
    return NextResponse.json({ error: 'Faltan número de cliente o factura' }, { status: 400 })
  }
  if (!clientLegalName?.trim() || !deliveryAddress?.trim()) {
    return NextResponse.json({ error: 'Faltan razón social o dirección de entrega' }, { status: 400 })
  }

  const { error } = await adminClient.from('orders').insert({
    client_number: clientNumber.trim(),
    invoice_number: invoiceNumber.trim(),
    client_legal_name: clientLegalName.trim(),
    fiscal_data: fiscalData?.trim() || null,
    delivery_address: deliveryAddress.trim(),
    notes: notes?.trim() || null,
    status: 'Ordered',
    created_by: createdBy ?? profile?.id ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('users')
    .select('roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  const isElevated = ['Admin', 'Purchasing', 'Warehouse', 'Route'].includes(roleName)
  const isSales = roleName === 'Sales'
  const isAdmin = roleName === 'Admin'

  if (!isElevated && !isSales) {
    return NextResponse.json({ error: 'No tienes permiso para actualizar pedidos' }, { status: 403 })
  }

  const body = await request.json()
  const {
    orderId,
    status: nextStatus,
    clientNumber,
    invoiceNumber,
    clientLegalName,
    fiscalData,
    deliveryAddress,
    notes,
    loadingUnit,
    currentProcessName,
  } = body as {
    orderId?: string
    status?: string
    clientNumber?: string
    invoiceNumber?: string
    clientLegalName?: string
    fiscalData?: string | null
    deliveryAddress?: string
    notes?: string | null
    loadingUnit?: string | null
    currentProcessName?: string
  }

  if (!orderId) return NextResponse.json({ error: 'Falta orderId' }, { status: 400 })

  const { data: existing } = await adminClient
    .from('orders')
    .select('deleted_at')
    .eq('id', orderId)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const isTrash = existing.deleted_at != null
  if (isTrash && !isAdmin) {
    return NextResponse.json({ error: 'Solo el administrador puede editar pedidos en papelera' }, { status: 403 })
  }

  if (nextStatus !== undefined && !isElevated) {
    return NextResponse.json({ error: 'No puedes cambiar el estado' }, { status: 403 })
  }
  if (currentProcessName !== undefined && !isElevated) {
    return NextResponse.json({ error: 'No puedes actualizar el proceso' }, { status: 403 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  let hasField = false

  if (nextStatus !== undefined) {
    if (!STATUSES.includes(nextStatus as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }
    updates.status = nextStatus
    hasField = true
    if (nextStatus === 'In process') {
      updates.current_process_name = currentProcessName?.trim() || 'Preparación del pedido'
      updates.process_updated_at = new Date().toISOString()
    }
    if (nextStatus === 'In route' && loadingUnit !== undefined) {
      updates.loading_unit = loadingUnit?.trim() || null
      hasField = true
    }
  }

  if (clientNumber !== undefined) {
    updates.client_number = clientNumber
    hasField = true
  }
  if (invoiceNumber !== undefined) {
    updates.invoice_number = invoiceNumber
    hasField = true
  }
  if (clientLegalName !== undefined) {
    updates.client_legal_name = clientLegalName.trim() || ''
    hasField = true
  }
  if (fiscalData !== undefined) {
    updates.fiscal_data = fiscalData?.trim() || null
    hasField = true
  }
  if (deliveryAddress !== undefined) {
    updates.delivery_address = deliveryAddress.trim() || ''
    hasField = true
  }
  if (notes !== undefined) {
    updates.notes = notes?.trim() || null
    hasField = true
  }
  if (loadingUnit !== undefined && nextStatus === undefined) {
    updates.loading_unit = loadingUnit?.trim() || null
    hasField = true
  }

  if (currentProcessName !== undefined && nextStatus === undefined) {
    const { data: ord } = await adminClient
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle()
    if (ord?.status !== 'In process') {
      return NextResponse.json({ error: 'Solo se puede definir proceso en estado En proceso' }, { status: 400 })
    }
    updates.current_process_name = currentProcessName.trim() || 'Preparación del pedido'
    updates.process_updated_at = new Date().toISOString()
    hasField = true
  }

  if (!hasField) {
    return NextResponse.json({ error: 'No hay cambios' }, { status: 400 })
  }

  let updateQuery = adminClient.from('orders').update(updates).eq('id', orderId)
  if (!isTrash) {
    updateQuery = updateQuery.is('deleted_at', null)
  }

  const { error } = await updateQuery

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('users')
    .select('roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const deleteRoleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  if (deleteRoleName !== 'Admin') {
    return NextResponse.json({ error: 'Solo Admin puede eliminar pedidos' }, { status: 403 })
  }

  const { orderId } = await request.json()
  if (!orderId) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const { error } = await adminClient
    .from('orders')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
