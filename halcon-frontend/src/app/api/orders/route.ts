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

  const { clientNumber, invoiceNumber, createdBy } = await request.json()
  if (!clientNumber || !invoiceNumber) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { error } = await adminClient.from('orders').insert({
    client_number: clientNumber,
    invoice_number: invoiceNumber,
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

  if (!isElevated && !isSales) {
    return NextResponse.json({ error: 'No tienes permiso para actualizar pedidos' }, { status: 403 })
  }

  const body = await request.json()
  const {
    orderId,
    status: nextStatus,
    clientNumber,
    invoiceNumber,
    currentProcessName,
  } = body as {
    orderId?: string
    status?: string
    clientNumber?: string
    invoiceNumber?: string
    currentProcessName?: string
  }

  if (!orderId) return NextResponse.json({ error: 'Falta orderId' }, { status: 400 })

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
  }

  if (clientNumber !== undefined) {
    updates.client_number = clientNumber
    hasField = true
  }
  if (invoiceNumber !== undefined) {
    updates.invoice_number = invoiceNumber
    hasField = true
  }

  if (currentProcessName !== undefined && nextStatus === undefined) {
    const { data: ord } = await adminClient
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .is('deleted_at', null)
      .single()
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

  const { error } = await adminClient
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .is('deleted_at', null)

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
