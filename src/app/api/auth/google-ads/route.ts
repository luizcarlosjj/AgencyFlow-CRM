import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/google-ads — inicia OAuth usando credenciais globais + MCC da agência
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  // Credenciais globais do desenvolvedor (env vars, não por agência)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID não configurado no servidor.' },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const agencyId = new URL(request.url).searchParams.get('agency_id');
  if (!agencyId) return NextResponse.json({ error: 'agency_id obrigatório' }, { status: 400 });

  // Valida que a agência configurou o MCC ID antes de iniciar o OAuth
  const { data: creds } = await supabase
    .from('agency_oauth_config')
    .select('google_mcc_id')
    .eq('agency_id', agencyId)
    .single();

  if (!creds?.google_mcc_id) {
    return NextResponse.json(
      { error: 'MCC ID não configurado. Vá em Configurações → Credenciais de API e preencha o Google MCC ID antes de conectar.' },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${appUrl}/api/auth/google-ads/callback`,
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/adwords',
    access_type:   'offline',
    prompt:        'consent',
    state:         agencyId,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
