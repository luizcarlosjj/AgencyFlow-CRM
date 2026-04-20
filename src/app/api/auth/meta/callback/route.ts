import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/meta/callback — troca code por token e salva
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const agencyId = searchParams.get('state');
  const error    = searchParams.get('error');

  if (error || !code || !agencyId) {
    return NextResponse.redirect(`${origin}/automation?error=meta_auth_failed`);
  }

  // Troca code por access_token
  const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.META_APP_ID ?? '',
      client_secret: process.env.META_APP_SECRET ?? '',
      redirect_uri:  `${origin}/api/auth/meta/callback`,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.redirect(`${origin}/automation?error=meta_token_failed`);
  }

  // Busca info da conta de Ads
  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${tokenData.access_token}`,
  );
  const meData = await meRes.json();
  const account = meData.data?.[0];

  // Persiste no banco via service_role (sem RLS)
  const supabase = await createClient();
  await supabase.from('integration_tokens').upsert({
    agency_id:     agencyId,
    provider:      'meta',
    access_token:  tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at:    tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
    account_id:    account?.id ?? null,
    account_name:  account?.name ?? 'Conta Meta Ads',
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'agency_id,provider' });

  return NextResponse.redirect(`${origin}/automation?connected=meta`);
}
