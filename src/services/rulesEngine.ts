/**
 * Motor de Avaliação de Regras
 * Avalia ConditionGroup contra métricas reais e executa ações via Meta/Google.
 */
import type { ConditionGroup, RuleActionConfig, AdsMetricsSnapshot, MutationResult, EntityLevel } from './ads/types';
import type { AutomationRule, IntegrationToken } from '@/lib/types';
import * as meta from './ads/metaAdsService';
import * as google from './ads/googleAdsService';

// ─── Avaliação de condições ───────────────────────────────────────────────────

function evalCondition(
  metrics: AdsMetricsSnapshot,
  metric: keyof AdsMetricsSnapshot,
  operator: string,
  value: number,
): boolean {
  const actual = metrics[metric] as number | undefined;
  if (actual === undefined) return false;
  switch (operator) {
    case '>':  return actual > value;
    case '<':  return actual < value;
    case '>=': return actual >= value;
    case '<=': return actual <= value;
    case '==': return actual === value;
    default:   return false;
  }
}

export function evaluateConditionGroup(
  metrics: AdsMetricsSnapshot,
  group: ConditionGroup,
): boolean {
  const results = group.conditions.map((c) =>
    evalCondition(metrics, c.metric as keyof AdsMetricsSnapshot, c.operator, c.value),
  );
  return group.logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

// ─── Execução de ação ─────────────────────────────────────────────────────────

export async function executeAction(
  rule: AutomationRule,
  entityId: string,
  actionConfig: RuleActionConfig,
  currentMetrics: AdsMetricsSnapshot,
  token?: IntegrationToken,
): Promise<MutationResult> {
  const accessToken = token?.access_token;
  const customerId  = token?.account_id;
  const platform    = rule.platform ?? 'meta';
  const level       = (rule.entity_level ?? 'campaign') as EntityLevel;

  if (actionConfig.type === 'alert') {
    console.warn(`[RulesEngine] ALERTA — "${rule.name}" | entidade: ${entityId} | métricas:`, currentMetrics);
    return { success: true, entity_id: entityId, action: 'alert', mock_mode: false };
  }

  if (actionConfig.type === 'pause') {
    if (platform === 'google') {
      if (level === 'adset') return google.setAdGroupStatus(customerId!, entityId, 'PAUSED', accessToken);
      return google.pauseCampaign(customerId!, entityId, accessToken);
    }
    if (level === 'ad')    return meta.pauseAd(entityId, accessToken);
    if (level === 'adset') return meta.pauseAdSet(entityId, accessToken);
    return meta.pauseCampaign(entityId, accessToken);
  }

  if (actionConfig.type === 'enable') {
    if (platform === 'google') {
      if (level === 'adset') return google.setAdGroupStatus(customerId!, entityId, 'ENABLED', accessToken);
      return google.enableCampaign(customerId!, entityId, accessToken);
    }
    if (level === 'ad')    return meta.enableAd(entityId, accessToken);
    if (level === 'adset') return meta.enableAdSet(entityId, accessToken);
    return meta.enableCampaign(entityId, accessToken);
  }

  if (actionConfig.type === 'increase_budget' || actionConfig.type === 'decrease_budget') {
    const pct        = (actionConfig.budget_change_pct ?? 15) / 100;
    const multiplier = actionConfig.type === 'increase_budget' ? (1 + pct) : (1 - pct);

    if (platform === 'google') {
      // Google: busca orçamento via GAQL antes de mutar — trata em micros
      // O entityId para budget é o resourceName do CampaignBudget, não da Campaign
      const currentMicros = currentMetrics.spend * 1_000_000;
      const newMicros = Math.round(currentMicros * multiplier);
      return google.updateCampaignBudget(customerId!, entityId, newMicros, accessToken);
    }

    // Meta: busca orçamento atual (em centavos) antes de mutar
    const currentBudgetCents = await meta.getCurrentBudget(entityId, accessToken!);
    const newBudgetCents = Math.round(currentBudgetCents * multiplier);
    return meta.updateDailyBudget(entityId, newBudgetCents, accessToken);
  }

  return { success: false, entity_id: entityId, action: 'unknown', mock_mode: false, error: 'Tipo de ação desconhecido' };
}

// ─── Verificação de dayparting ────────────────────────────────────────────────

export function shouldRunBySchedule(rule: AutomationRule): boolean {
  if (!rule.schedule) return true;
  return rule.schedule.days.includes(new Date().getDay());
}

// ─── Descrição legível de uma regra ──────────────────────────────────────────

export function describeRule(rule: AutomationRule): string {
  if (!rule.condition_group) return rule.name;
  const { logic, conditions } = rule.condition_group;
  return conditions
    .map((c) => `${c.metric} ${c.operator} ${c.value} (${c.time_window})`)
    .join(` ${logic} `);
}
