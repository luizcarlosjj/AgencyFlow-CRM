/**
 * GET  /api/agency/credentials?agency_id=xxx
 *   Retorna campos públicos + flags para secrets já configurados.
 *   Nunca devolve valores criptografados ao cliente.
 *
 * POST /api/agency/credentials
 *   Body: { agency_id, meta_app_id?, meta_app_secret?, google_mcc_id? }
 *   Campos de secret em branco são ignorados — valor existente é preservado.
 *   Secrets são criptografados com AES-256-GCM antes de salvar.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt, isEncrypted } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const agencyId = new URL(request.url).searchParams.get('agency_id');
  if (!agencyId) return NextResponse.json({ error: 'agency_id obrigatório' }, { status: 400 });

  const { data } = await supabase
    .from('agency_oauth_config')
    .select('meta_app_id, meta_app_secret_enc, google_mcc_id')
    .eq('agency_id', agencyId)
    .single();

  return NextResponse.json({
    meta_app_id:     data?.meta_app_id     ?? '',
    google_mcc_id:   data?.google_mcc_id   ?? '',
    has_meta_secret: isEncrypted(data?.meta_app_secret_enc),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await request.json() as {
    agency_id: string;
    meta_app_id?: string;
    meta_app_secret?: string;
    google_mcc_id?: string;
  };

  const { agency_id } = body;
  if (!agency_id) return NextResponse.json({ error: 'agency_id obrigatório' }, { status: 400 });

  const patch: Record<string, string> = {};

  if (body.meta_app_id    !== undefined) patch.meta_app_id         = body.meta_app_id.trim();
  if (body.meta_app_secret?.trim())      patch.meta_app_secret_enc = encrypt(body.meta_app_secret.trim());
  if (body.google_mcc_id  !== undefined) patch.google_mcc_id       = body.google_mcc_id.replace(/-/g, '').trim();

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo enviado.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('agency_oauth_config')
    .upsert({ agency_id, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'agency_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
