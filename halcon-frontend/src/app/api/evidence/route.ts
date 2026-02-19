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
  if (!['Admin', 'Route', 'Warehouse'].includes(roleName)) {
    return NextResponse.json({ error: 'No tienes permiso para subir evidencias' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const orderId = formData.get('orderId') as string | null
  const evidenceType = formData.get('evidenceType') as string | null
  if (!file || !orderId || !evidenceType) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const validTypes = ['loading', 'unloading', 'delivery']
  if (!validTypes.includes(evidenceType)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${orderId}/${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from('evidence')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const { data: urlData } = adminClient.storage.from('evidence').getPublicUrl(uploadData.path)
  const photoUrl = urlData.publicUrl

  const { error: dbError } = await adminClient.from('evidence').insert({
    order_id: orderId,
    photo_url: photoUrl,
    evidence_type: evidenceType,
    created_by: profile?.id ?? null,
  })

  if (dbError) {
    await adminClient.storage.from('evidence').remove([uploadData.path])
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
