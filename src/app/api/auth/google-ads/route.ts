import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/google-ads — inicia o fluxo OAuth do Google Ads
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  // Valida env vars antes de redirecionar
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (!clientId || clientId === 'your-google-client-id') {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID não configurado. Adicione ao .env.local e reinicie o servidor.' },
      { status: 500 },
    );
  }
  if (!clientSecret || clientSecret === 'your-google-client-secret') {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_SECRET não configurado. Adicione ao .env.local e reinicie o servidor.' },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const agencyId = searchParams.get('agency_id');
  if (!agencyId) return NextResponse.json({ error: 'agency_id obrigatório' }, { status: 400 });

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
