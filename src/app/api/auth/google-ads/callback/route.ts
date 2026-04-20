import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/google-ads/callback
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const agencyId = searchParams.get('state');
  const error    = searchParams.get('error');

  if (error || !code || !agencyId) {
    return NextResponse.redirect(`${origin}/automation?error=google_auth_failed`);
  }

  // Troca code por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri:  `${origin}/api/auth/google-ads/callback`,
      grant_type:    'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.redirect(`${origin}/automation?error=google_token_failed`);
  }

  // Busca Customer IDs acessíveis
  const customersRes = await fetch(
    'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
      },
    },
  );
  const customersData = await customersRes.json();
  const firstAccount = customersData.resourceNames?.[0] ?? null;
  const customerId = firstAccount?.replace('customers/', '') ?? null;

  const supabase = await createClient();
  await supabase.from('integration_tokens').upsert({
    agency_id:     agencyId,
    provider:      'google_ads',
    access_token:  tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at:    tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
    account_id:    customerId,
    account_name:  customerId ? `Google Ads — ${customerId}` : 'Google Ads',
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'agency_id,provider' });

  return NextResponse.redirect(`${origin}/automation?connected=google`);
}
