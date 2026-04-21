import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decrypt, isEncrypted } from '@/lib/encryption';

// GET /api/auth/meta — inicia o fluxo OAuth do Meta usando credenciais da agência
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const agencyId = new URL(request.url).searchParams.get('agency_id');
  if (!agencyId) return NextResponse.json({ error: 'agency_id obrigatório' }, { status: 400 });

  // Busca credenciais da agência (RLS garante que só o dono acessa)
  const { data: creds, error: dbError } = await supabase
    .from('agency_oauth_config')
    .select('meta_app_id, meta_app_secret_enc')
    .eq('agency_id', agencyId)
    .single();

  if (dbError || !creds?.meta_app_id) {
    return NextResponse.json(
      { error: 'App ID do Meta não configurado. Vá em Configurações → Credenciais de API.' },
      { status: 400 },
    );
  }
  if (!isEncrypted(creds.meta_app_secret_enc)) {
    return NextResponse.json(
      { error: 'App Secret do Meta não configurado. Vá em Configurações → Credenciais de API.' },
      { status: 400 },
    );
  }

  // Decrypt server-side — nunca exposto ao cliente
  const appSecret = decrypt(creds.meta_app_secret_enc!);
  void appSecret; // usado só na callback; aqui validamos a existência

  const params = new URLSearchParams({
    client_id:     creds.meta_app_id,
    redirect_uri:  `${appUrl}/api/auth/meta/callback`,
    scope:         'ads_management,ads_read,business_management',
    response_type: 'code',
    state:         agencyId,
  });

  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
}
