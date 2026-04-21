import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as Google from '@/services/ads/googleAdsService';
import * as Meta from '@/services/ads/metaAdsService';
import type { LiveCampaign } from '@/lib/types';

const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: clientId } = await params;
  const sb = await createClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: agency } = await sb.from('agencies').select('id').eq('owner_id', user.id).single();
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

  const platform = req.nextUrl.searchParams.get('platform') as 'google' | 'meta' | null;
  const force = req.nextUrl.searchParams.get('force') === 'true';

  const { data: client } = await sb
    .from('clients')
    .select('id, google_customer_id, meta_ad_account_id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const platforms: Array<'google' | 'meta'> = platform
    ? [platform]
    : [
        ...(client.google_customer_id ? ['google' as const] : []),
        ...(client.meta_ad_account_id ? ['meta' as const] : []),
      ];

  if (platforms.length === 0) {
    return NextResponse.json({ campaigns: [], cached: false });
  }

  const results: LiveCampaign[] = [];
  const fetchedPlatforms: string[] = [];

  for (const p of platforms) {
    if (!force) {
      const { data: cached } = await sb
        .from('campaign_cache')
        .select('campaigns, synced_at')
        .eq('client_id', clientId)
        .eq('platform', p)
        .single();

      if (cached && Date.now() - new Date(cached.synced_at).getTime() < CACHE_TTL_MS) {
        results.push(...(cached.campaigns as LiveCampaign[]));
        continue;
      }
    }

    fetchedPlatforms.push(p);

    const { data: token } = await sb
      .from('integration_tokens')
      .select('access_token, account_id')
      .eq('agency_id', agency.id)
      .eq('provider', p === 'google' ? 'google_ads' : 'meta')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!token) continue;

    let fresh: LiveCampaign[] = [];

    try {
      if (p === 'google' && client.google_customer_id) {
        const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '';
        fresh = await Google.listCampaigns(
          token.account_id ?? '',
          client.google_customer_id,
          devToken,
          token.access_token,
        );
      } else if (p === 'meta' && client.meta_ad_account_id) {
        fresh = await Meta.listCampaigns(client.meta_ad_account_id, token.access_token);
      }
    } catch (err) {
      console.error(`[campaigns] fetch error (${p}):`, err);
      continue;
    }

    await sb.from('campaign_cache').upsert(
      { agency_id: agency.id, client_id: clientId, platform: p, campaigns: fresh, synced_at: new Date().toISOString() },
      { onConflict: 'client_id,platform' },
    );

    results.push(...fresh);
  }

  return NextResponse.json({ campaigns: results, fetched_platforms: fetchedPlatforms });
}
