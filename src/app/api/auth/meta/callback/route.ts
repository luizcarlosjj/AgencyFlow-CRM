import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/meta/callback — troca code por token e salva
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const agencyId = searchParams.get('state');
  const error    = searchParams.get('error');
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  const completeUrl = (err?: string) =>
    err
      ? `${appUrl}/auth/oauth-complete?provider=meta&error=${encodeURIComponent(err)}`
      : `${appUrl}/auth/oauth-complete?provider=meta`;

  if (error || !code || !agencyId) {
    return NextResponse.redirect(completeUrl(error ?? 'meta_auth_failed'));
  }

  // Troca code por access_token
  const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.META_APP_ID ?? '',
      client_secret: process.env.META_APP_SECRET ?? '',
      redirect_uri:  `${appUrl}/api/auth/meta/callback`,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    const msg = tokenData.error?.message ?? 'meta_token_failed';
    return NextResponse.redirect(completeUrl(msg));
  }

  // Busca contas de Ads do usuário
  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
  );
  const meData = await meRes.json();
  const account = meData.data?.[0];

  const supabase = await createClient();
  const { error: dbError } = await supabase.from('integration_tokens').upsert({
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

  if (dbError) return NextResponse.redirect(completeUrl(dbError.message));

  return NextResponse.redirect(completeUrl());
}
