/**
 * Meta Graph API Marketing Service — v19.0
 *
 * Autenticação: Authorization: Bearer {access_token}
 * Insights:     level obrigatório + date_preset
 * Mutações:     POST /{id} com JSON; budget em centavos (R$50 = 5000)
 * Rate limit:   mutações agrupadas via Batch API (máx 50/request)
 */
import type { MutationResult, AdsMetricsSnapshot, TimeWindow, EntityLevel } from './types';

const BASE = 'https://graph.facebook.com/v19.0';
const BATCH_BASE = 'https://graph.facebook.com/';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function requireToken(token: string | undefined): string {
  if (!token) throw new Error('[MetaAds] access_token ausente. Configure a integração em Automação → Conectar Meta.');
  return token;
}

// ─── Mapeamento de date_preset ────────────────────────────────────────────────
// Presets válidos: today, yesterday, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, lifetime
function toDatePreset(range: TimeWindow): string {
  const map: Record<TimeWindow, string> = {
    today: 'today',
    '3d':  'last_3d',
    '7d':  'last_7d',
    '30d': 'last_30d',
  };
  return map[range];
}

// ─── Mutação de status (individual) ──────────────────────────────────────────

async function setStatus(
  entityId: string,
  status: 'ACTIVE' | 'PAUSED',
  token: string,
): Promise<MutationResult> {
  const url = `${BASE}/${entityId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, entity_id: entityId, action: `set_status_${status}`, mock_mode: false, error: data.error?.message ?? 'Erro Meta API' };
  }
  return { success: true, entity_id: entityId, action: `set_status_${status}`, mock_mode: false };
}

export const pauseCampaign  = (id: string, token?: string) => setStatus(id, 'PAUSED',  requireToken(token));
export const enableCampaign = (id: string, token?: string) => setStatus(id, 'ACTIVE',  requireToken(token));
export const pauseAdSet     = (id: string, token?: string) => setStatus(id, 'PAUSED',  requireToken(token));
export const enableAdSet    = (id: string, token?: string) => setStatus(id, 'ACTIVE',  requireToken(token));
export const pauseAd        = (id: string, token?: string) => setStatus(id, 'PAUSED',  requireToken(token));
export const enableAd       = (id: string, token?: string) => setStatus(id, 'ACTIVE',  requireToken(token));

// ─── Batch API — agrupa até 50 mutações em 1 request ─────────────────────────
// Spec: https://developers.facebook.com/docs/graph-api/batch-requests

export interface BatchOperation {
  method: 'POST' | 'GET' | 'DELETE';
  relative_url: string;
  body?: string;
}

export async function batchMutate(
  operations: BatchOperation[],
  token: string,
): Promise<{ success: boolean; errors: string[] }> {
  if (operations.length === 0) return { success: true, errors: [] };
  if (operations.length > 50) throw new Error('[MetaAds] Batch API: máximo de 50 operações por request.');

  const res = await fetch(BATCH_BASE, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ batch: operations }),
  });
  const results = await res.json() as Array<{ code: number; body: string }>;
  const errors = results
    .filter((r) => r.code < 200 || r.code >= 300)
    .map((r) => {
      try { return JSON.parse(r.body)?.error?.message ?? `HTTP ${r.code}`; }
      catch { return `HTTP ${r.code}`; }
    });
  return { success: errors.length === 0, errors };
}

// ─── Atualizar orçamento diário de um AdSet ───────────────────────────────────
// Atenção: daily_budget deve ser em centavos — R$50,00 = 5000

export async function updateDailyBudget(
  adSetId: string,
  newBudgetCents: number,
  token?: string,
): Promise<MutationResult> {
  const t = requireToken(token);
  const res = await fetch(`${BASE}/${adSetId}`, {
    method: 'POST',
    headers: authHeaders(t),
    body: JSON.stringify({ daily_budget: Math.round(newBudgetCents) }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, entity_id: adSetId, action: 'set_budget', mock_mode: false, error: data.error?.message };
  }
  return { success: true, entity_id: adSetId, action: `set_budget_${newBudgetCents}`, mock_mode: false };
}

// ─── Buscar orçamento diário atual de um AdSet ────────────────────────────────

export async function getCurrentBudget(adSetId: string, token: string): Promise<number> {
  const res = await fetch(`${BASE}/${adSetId}?fields=daily_budget`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Erro ao buscar orçamento');
  return Number(data.daily_budget ?? 0);
}

// ─── Métricas via /insights ───────────────────────────────────────────────────
// Spec: level obrigatório + date_preset obrigatório

export async function getEntityMetrics(
  entityId: string,
  level: EntityLevel,
  range: TimeWindow,
  token?: string,
): Promise<AdsMetricsSnapshot> {
  const t = requireToken(token);

  const metaLevel = level === 'adset' ? 'adset' : level === 'ad' ? 'ad' : 'campaign';
  const fields = 'spend,actions,action_values,frequency,ctr,impressions,clicks';
  const url = `${BASE}/${entityId}/insights?fields=${fields}&level=${metaLevel}&date_preset=${toDatePreset(range)}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
  const json = await res.json();

  if (!res.ok) throw new Error(json.error?.message ?? 'Erro ao buscar insights Meta');

  const d = json.data?.[0] ?? {};
  const spend = Number(d.spend ?? 0);

  // Conversões: filtra por purchase ou lead (o mais relevante para agências)
  const conversions = Number(
    d.actions?.find((a: { action_type: string; value: string }) =>
      a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase',
    )?.value ?? 0,
  );

  // ROAS: soma purchase_roas ou usa action_values filtrado por purchase
  const purchaseValue = Number(
    d.action_values?.find((a: { action_type: string; value: string }) =>
      a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase',
    )?.value ?? 0,
  );

  return {
    spend,
    conversions,
    cpa:         conversions > 0 ? spend / conversions : 0,
    roas:        spend > 0 ? purchaseValue / spend : 0,
    frequency:   Number(d.frequency ?? 0),
    ctr:         Number(d.ctr ?? 0),
    impressions: Number(d.impressions ?? 0),
    clicks:      Number(d.clicks ?? 0),
    date_range:  range,
  };
}
