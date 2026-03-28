import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('users')
    .select('roles(name)')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single()

  const roleName = (Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles)?.name ?? ''
  if (roleName !== 'Admin') {
    return { error: NextResponse.json({ error: 'Solo Admin' }, { status: 403 }) }
  }
  return { adminClient, authUserId: user.id }
}

export async function POST(request: Request) {
  const gate = await requireAdmin()
  if ('error' in gate) return gate.error
  const { adminClient } = gate

  const { email, password, fullName, roleId, departmentId } = await request.json()
  if (!email || !password || !fullName || !roleId) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: dbError } = await adminClient.from('users').insert({
    auth_id: authUser.user.id,
    email,
    full_name: fullName,
    role_id: roleId,
    department_id: departmentId ?? null,
  })

  if (dbError) {
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const gate = await requireAdmin()
  if ('error' in gate) return gate.error
  const { adminClient } = gate

  const body = await request.json()
  const {
    userId,
    roleId,
    departmentId,
    fullName,
    email,
    active,
  } = body as {
    userId?: string
    roleId?: string
    departmentId?: string | null
    fullName?: string
    email?: string
    active?: boolean
  }

  if (!userId) return NextResponse.json({ error: 'Falta userId' }, { status: 400 })

  const { data: target } = await adminClient
    .from('users')
    .select('id, auth_id, email')
    .eq('id', userId)
    .single()

  if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (roleId !== undefined) updates.role_id = roleId
  if (departmentId !== undefined) updates.department_id = departmentId
  if (fullName !== undefined) updates.full_name = fullName
  if (email !== undefined) updates.email = email
  if (active === true) updates.deleted_at = null
  if (active === false) updates.deleted_at = new Date().toISOString()

  if (email !== undefined && target.auth_id) {
    const { error: authUpd } = await adminClient.auth.admin.updateUserById(target.auth_id, { email })
    if (authUpd) return NextResponse.json({ error: authUpd.message }, { status: 400 })
  }

  const { error } = await adminClient.from('users').update(updates).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
