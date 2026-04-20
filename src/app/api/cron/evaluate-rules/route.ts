/**
 * POST /api/cron/evaluate-rules
 * Chamado pelo Vercel Cron (ou manualmente via curl).
 * Protegido por CRON_SECRET no header Authorization.
 *
 * Vercel cron.json:
 * { "crons": [{ "path": "/api/cron/evaluate-rules", "schedule": "0 * * * *" }] }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluateConditionGroup, executeAction, shouldRunBySchedule } from '@/services/rulesEngine';
import { getEntityMetrics as metaMetrics } from '@/services/ads/metaAdsService';
import { getCampaignMetrics as googleMetrics } from '@/services/ads/googleAdsService';
import type { AutomationRule, IntegrationToken } from '@/lib/types';

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // Busca todas as regras ativas com campos compostos preenchidos
  const { data: rules } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('is_active', true)
    .not('condition_group', 'is', null);

  if (!rules?.length) {
    return NextResponse.json({ processed: 0, message: 'Nenhuma regra composta ativa' });
  }

  const results: { rule: string; success: boolean; action: string }[] = [];

  for (const rule of rules as AutomationRule[]) {
    if (!shouldRunBySchedule(rule)) continue;
    if (!rule.condition_group || !rule.action_config) continue;

    // Busca token de integração da agência
    const { data: tokenRow } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('agency_id', rule.agency_id)
      .eq('provider', rule.platform === 'google' ? 'google_ads' : 'meta')
      .single();

    const token = tokenRow as IntegrationToken | null;
    const entityId = token?.account_id ?? `mock-entity-${rule.id}`;
    const timeWindow = rule.condition_group.conditions[0]?.time_window ?? '1d';

    // Busca métricas (mock se não houver token real)
    let metrics;
    try {
      if (rule.platform === 'google') {
        metrics = await googleMetrics(token?.account_id ?? '', entityId, timeWindow, token?.access_token);
      } else {
        metrics = await metaMetrics(entityId, timeWindow, token?.access_token);
      }
    } catch {
      metrics = null;
    }

    if (!metrics) {
      await supabase.from('automation_logs').insert({
        rule_id: rule.id, agency_id: rule.agency_id, rule_name: rule.name,
        platform: rule.platform, entity_id: entityId, conditions_met: false,
        action_taken: 'skipped', success: false,
        error_message: 'Não foi possível buscar métricas', mock_mode: !token,
      });
      continue;
    }

    const conditionsMet = evaluateConditionGroup(metrics, rule.condition_group);

    let mutationResult = { success: true, entity_id: entityId, action: 'no_action', mock_mode: !token };

    if (conditionsMet) {
      mutationResult = await executeAction(rule, entityId, rule.action_config, metrics, token ?? undefined);
    }

    // Persiste log
    await supabase.from('automation_logs').insert({
      rule_id: rule.id, agency_id: rule.agency_id, rule_name: rule.name,
      platform: rule.platform, entity_id: entityId, entity_level: rule.entity_level,
      metrics_snapshot: metrics, conditions_met: conditionsMet,
      action_taken: conditionsMet ? mutationResult.action : 'conditions_not_met',
      success: mutationResult.success,
      error_message: (mutationResult as { error?: string }).error ?? null,
      mock_mode: mutationResult.mock_mode,
    });

    results.push({ rule: rule.name, success: mutationResult.success, action: mutationResult.action });
  }

  return NextResponse.json({ processed: results.length, results });
}
