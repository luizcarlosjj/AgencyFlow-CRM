import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/google-ads/callback
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const agencyId = searchParams.get('state');
  const error    = searchParams.get('error');
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  const completeUrl = (err?: string) =>
    err
      ? `${appUrl}/auth/oauth-complete?provider=google&error=${encodeURIComponent(err)}`
      : `${appUrl}/auth/oauth-complete?provider=google`;

  if (error || !code || !agencyId) {
    return NextResponse.redirect(completeUrl(error ?? 'google_auth_failed'));
  }

  // Credenciais globais do desenvolvedor
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const devToken     = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(completeUrl('Credenciais Google não configuradas no servidor.'));
  }

  const supabase = await createClient();

  // Busca MCC ID da agência (necessário para login-customer-id)
  const { data: creds } = await supabase
    .from('agency_oauth_config')
    .select('google_mcc_id')
    .eq('agency_id', agencyId)
    .single();

  if (!creds?.google_mcc_id) {
    return NextResponse.redirect(completeUrl('MCC ID não configurado para esta agência.'));
  }

  const mccId = creds.google_mcc_id.replace(/-/g, '');

  // Troca code por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  `${appUrl}/api/auth/google-ads/callback`,
      grant_type:    'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.redirect(completeUrl(tokenData.error_description ?? tokenData.error ?? 'google_token_failed'));
  }

  // Tenta buscar clientes acessíveis apenas para montar o nome da conta — não crítico
  let accountName = `Google Ads MCC ${mccId}`;
  try {
    const customersRes = await fetch(
      'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers',
      {
        headers: {
          Authorization:       `Bearer ${tokenData.access_token}`,
          'developer-token':   devToken ?? '',
          'login-customer-id': mccId,
        },
      },
    );
    const contentType = customersRes.headers.get('content-type') ?? '';
    if (customersRes.ok && contentType.includes('application/json')) {
      const customersData = await customersRes.json();
      if (customersData.resourceNames?.length) {
        accountName = `Google Ads MCC ${mccId}`;
      }
    }
  } catch {
    // Falha silenciosa — o token já foi obtido, apenas o nome da conta não foi resolvido
  }

  // Persiste — account_id = MCC ID (usado como login-customer-id em todas as chamadas)
  const { error: dbError } = await supabase.from('integration_tokens').upsert({
    agency_id:     agencyId,
    provider:      'google_ads',
    access_token:  tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at:    tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
    account_id:    mccId,
    account_name:  accountName,
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'agency_id,provider' });

  if (dbError) return NextResponse.redirect(completeUrl(dbError.message));

  return NextResponse.redirect(completeUrl());
}
