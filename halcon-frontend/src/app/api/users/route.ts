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
    return NextResponse.json({ error: 'Solo Admin puede crear usuarios' }, { status: 403 })
  }

  const { email, password, fullName, roleId } = await request.json()
  if (!email || !password || !fullName || !roleId) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: dbError } = await adminClient.from('users').insert({
    auth_id: authUser.user.id,
    email,
    full_name: fullName,
    role_id: roleId,
  })

  if (dbError) {
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

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
  if (roleName !== 'Admin') {
    return NextResponse.json({ error: 'Solo Admin puede asignar roles' }, { status: 403 })
  }

  const { userId, roleId } = await request.json()
  if (!userId || !roleId) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const { error } = await adminClient
    .from('users')
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
