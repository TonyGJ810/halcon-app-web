import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const patchRoleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  if (!['Admin', 'Purchasing', 'Warehouse', 'Route'].includes(patchRoleName)) {
    return NextResponse.json({ error: 'No tienes permiso para actualizar pedidos' }, { status: 403 })
  }

  const { orderId, status } = await request.json()
  if (!orderId || !status) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const valid = ['Ordered', 'In process', 'In route', 'Delivered'].includes(status)
  if (!valid) return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })

  const { error } = await adminClient
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
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
