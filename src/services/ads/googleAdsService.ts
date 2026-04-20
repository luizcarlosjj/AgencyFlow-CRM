/**
 * Google Ads REST API Service — v14
 *
 * Autenticação: OAuth 2.0 + Developer Token
 * Header obrigatório: login-customer-id (MCC ID)
 * Leitura: GAQL via SearchStream (economiza cota — 15k/dia no básico)
 * Valores financeiros: retornados em micros → divide por 1.000.000
 * Mutações: MutateOperation com update_mask obrigatório
 * Orçamentos: alterados via CampaignBudgetService (separado da campanha)
 */
import type { MutationResult, AdsMetricsSnapshot, TimeWindow } from './types';

const BASE = 'https://googleads.googleapis.com/v14';

function requireToken(token: string | undefined): string {
  if (!token) throw new Error('[GoogleAds] access_token ausente. Configure a integração em Automação → Conectar Google.');
  return token;
}

function requireDeveloperToken(): string {
  const dt = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!dt) throw new Error('[GoogleAds] GOOGLE_ADS_DEVELOPER_TOKEN não configurado.');
  return dt;
}

// ─── Headers padrão ───────────────────────────────────────────────────────────
// login-customer-id = ID da MCC (conta de gestão). Obrigatório pela spec.
// Fallback: usa o próprio customerId se não houver MCC.

function headers(token: string, mccCustomerId?: string, customerId?: string) {
  return {
    Authorization:        `Bearer ${token}`,
    'developer-token':    requireDeveloperToken(),
    'login-customer-id':  (mccCustomerId ?? customerId ?? '').replace('customers/', ''),
    'Content-Type':       'application/json',
  };
}

// ─── Data range para GAQL ─────────────────────────────────────────────────────
// GAQL válidos: TODAY, YESTERDAY, LAST_7_DAYS, LAST_14_DAYS, LAST_30_DAYS, THIS_MONTH, LAST_MONTH, ALL_TIME
// Para 3 dias não existe cláusula pronta — usa date range explícito

function toGaqlDateClause(range: TimeWindow): string {
  if (range === 'today') return 'DURING TODAY';
  if (range === '7d')    return 'DURING LAST_7_DAYS';
  if (range === '30d')   return 'DURING LAST_30_DAYS';
  // '3d': não existe LAST_3_DAYS — calcula datas explicitamente
  const end   = new Date(); end.setHours(0, 0, 0, 0);
  const start = new Date(end); start.setDate(start.getDate() - 3);
  const fmt   = (d: Date) => d.toISOString().slice(0, 10);
  return `BETWEEN '${fmt(start)}' AND '${fmt(end)}'`;
}

// ─── Mutação de status de campanha ────────────────────────────────────────────

export async function setCampaignStatus(
  customerId: string,
  campaignResourceName: string,
  status: 'ENABLED' | 'PAUSED',
  token?: string,
  mccId?: string,
): Promise<MutationResult> {
  const t = requireToken(token);
  const cid = customerId.replace('customers/', '');
  const body = {
    operations: [{ update: { resourceName: campaignResourceName, status }, updateMask: 'status' }],
  };
  const res = await fetch(`${BASE}/customers/${cid}/campaigns:mutate`, {
    method: 'POST',
    headers: headers(t, mccId, cid),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, entity_id: campaignResourceName, action: 'set_status', mock_mode: false, error: data.error?.message ?? JSON.stringify(data.errors?.[0]) };
  }
  return { success: true, entity_id: campaignResourceName, action: `set_status_${status}`, mock_mode: false };
}

export const pauseCampaign  = (cid: string, resource: string, t?: string, mcc?: string) => setCampaignStatus(cid, resource, 'PAUSED',  t, mcc);
export const enableCampaign = (cid: string, resource: string, t?: string, mcc?: string) => setCampaignStatus(cid, resource, 'ENABLED', t, mcc);

// ─── Mutação de status de AdGroup ────────────────────────────────────────────

export async function setAdGroupStatus(
  customerId: string,
  adGroupResourceName: string,
  status: 'ENABLED' | 'PAUSED',
  token?: string,
  mccId?: string,
): Promise<MutationResult> {
  const t = requireToken(token);
  const cid = customerId.replace('customers/', '');
  const body = {
    operations: [{ update: { resourceName: adGroupResourceName, status }, updateMask: 'status' }],
  };
  const res = await fetch(`${BASE}/customers/${cid}/adGroups:mutate`, {
    method: 'POST',
    headers: headers(t, mccId, cid),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, entity_id: adGroupResourceName, action: 'set_status', mock_mode: false, error: data.error?.message };
  }
  return { success: true, entity_id: adGroupResourceName, action: `set_status_${status}`, mock_mode: false };
}

// ─── Atualizar orçamento via CampaignBudgetService ────────────────────────────
// Spec: orçamentos ficam no CampaignBudget, não na Campaign.
// amountMicros: R$50,00 → 50_000_000 (50 * 1.000.000)

export async function updateCampaignBudget(
  customerId: string,
  budgetResourceName: string,
  newAmountMicros: number,
  token?: string,
  mccId?: string,
): Promise<MutationResult> {
  const t = requireToken(token);
  const cid = customerId.replace('customers/', '');
  const body = {
    operations: [{
      update: { resourceName: budgetResourceName, amountMicros: String(Math.round(newAmountMicros)) },
      updateMask: 'amountMicros',
    }],
  };
  const res = await fetch(`${BASE}/customers/${cid}/campaignBudgets:mutate`, {
    method: 'POST',
    headers: headers(t, mccId, cid),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, entity_id: budgetResourceName, action: 'set_budget', mock_mode: false, error: data.error?.message };
  }
  return { success: true, entity_id: budgetResourceName, action: `set_budget_${newAmountMicros}`, mock_mode: false };
}

// ─── Métricas via SearchStream (GAQL) ────────────────────────────────────────
// Agrega todos os chunks retornados pelo stream.
// Valores financeiros chegam em micros — divide por 1.000.000.

export async function getCampaignMetrics(
  customerId: string,
  campaignId: string,
  range: TimeWindow,
  token?: string,
  mccId?: string,
): Promise<AdsMetricsSnapshot> {
  const t = requireToken(token);
  const cid = customerId.replace('customers/', '');
  const dateClause = toGaqlDateClause(range);

  const query = `
    SELECT
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.ctr,
      metrics.impressions,
      metrics.clicks
    FROM campaign
    WHERE campaign.id = ${campaignId}
    AND segments.date ${dateClause}
  `.trim();

  const res = await fetch(`${BASE}/customers/${cid}/googleAds:searchStream`, {
    method: 'POST',
    headers: headers(t, mccId, cid),
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Erro Google Ads SearchStream');
  }

  // SearchStream retorna array de chunks — agrega todos os results
  const chunks = (await res.json()) as Array<{ results?: Array<{ metrics: Record<string, string> }> }>;
  const allResults = chunks.flatMap((c) => c.results ?? []);

  let costMicros = 0, conversions = 0, conversionsValue = 0, impressions = 0, clicks = 0;

  for (const r of allResults) {
    const m = r.metrics;
    costMicros      += Number(m.costMicros ?? m['cost_micros'] ?? 0);
    conversions     += Number(m.conversions ?? 0);
    conversionsValue += Number(m.conversionsValue ?? m['conversions_value'] ?? 0);
    impressions     += Number(m.impressions ?? 0);
    clicks          += Number(m.clicks ?? 0);
  }

  const spend = costMicros / 1_000_000;

  return {
    spend,
    conversions,
    cpa:         conversions > 0 ? spend / conversions : 0,
    roas:        spend > 0 ? conversionsValue / spend : 0,
    ctr:         impressions > 0 ? (clicks / impressions) * 100 : 0,
    impressions,
    clicks,
    date_range: range,
  };
}
