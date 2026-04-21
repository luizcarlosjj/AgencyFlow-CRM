import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as Google from '@/services/ads/googleAdsService';
import * as Meta from '@/services/ads/metaAdsService';

interface ActionBody {
  platform: 'google' | 'meta';
  client_id: string;
  campaign_id: string;
  action: 'pause' | 'enable' | 'update_budget';
  daily_budget_brl?: number;
  customer_id?: string;
  budget_resource?: string;
  mcc_id?: string;
}

export async function POST(req: NextRequest) {
  const sb = await createClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: agency } = await sb.from('agencies').select('id').eq('owner_id', user.id).single();
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

  const body: ActionBody = await req.json();
  const { platform, client_id, campaign_id, action, daily_budget_brl, customer_id, budget_resource, mcc_id } = body;

  const { data: token } = await sb
    .from('integration_tokens')
    .select('access_token, account_id')
    .eq('agency_id', agency.id)
    .eq('provider', platform === 'google' ? 'google_ads' : 'meta')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!token) return NextResponse.json({ error: `Token ${platform} não encontrado` }, { status: 400 });

  let result;

  try {
    if (platform === 'meta') {
      if (action === 'pause')       result = await Meta.pauseCampaign(campaign_id, token.access_token);
      else if (action === 'enable') result = await Meta.enableCampaign(campaign_id, token.access_token);
      else if (action === 'update_budget' && daily_budget_brl != null)
        result = await Meta.updateDailyBudget(campaign_id, daily_budget_brl * 100, token.access_token);
    } else {
      if (!customer_id) return NextResponse.json({ error: 'customer_id obrigatório para Google' }, { status: 400 });
      const mcc = mcc_id ?? token.account_id ?? '';

      if (action === 'pause')       result = await Google.pauseCampaign(customer_id, campaign_id, token.access_token, mcc);
      else if (action === 'enable') result = await Google.enableCampaign(customer_id, campaign_id, token.access_token, mcc);
      else if (action === 'update_budget' && daily_budget_brl != null) {
        if (!budget_resource) return NextResponse.json({ error: 'budget_resource obrigatório para Google' }, { status: 400 });
        result = await Google.updateCampaignBudget(customer_id, budget_resource, daily_budget_brl * 1_000_000, token.access_token, mcc);
      }
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro interno' }, { status: 500 });
  }

  if (!result) return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });

  if (result.success) {
    await sb.from('campaign_cache').delete().eq('client_id', client_id).eq('platform', platform);
  }

  return NextResponse.json(result);
}
