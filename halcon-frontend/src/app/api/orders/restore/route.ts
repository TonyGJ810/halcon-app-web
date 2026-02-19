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
    .select('roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  if (roleName !== 'Admin') {
    return NextResponse.json({ error: 'Solo Admin puede restaurar pedidos' }, { status: 403 })
  }

  const { orderId } = await request.json()
  if (!orderId) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const { error } = await adminClient
    .from('orders')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .not('deleted_at', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
