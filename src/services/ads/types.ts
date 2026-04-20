// ─── Enums e tipos base ──────────────────────────────────────────────────────

export type MetricKey =
  | 'cpa' | 'spend' | 'conversions' | 'roas'
  | 'frequency' | 'ctr' | 'impressions' | 'clicks';

export type ConditionOperator = '>' | '<' | '>=' | '<=' | '==';
export type TimeWindow = 'today' | '3d' | '7d' | '30d';
export type LogicOperator = 'AND' | 'OR';
export type ActionType = 'pause' | 'enable' | 'increase_budget' | 'decrease_budget' | 'alert';
export type EntityLevel = 'campaign' | 'adset' | 'ad' | 'account';
export type AdsPlatform = 'meta' | 'google' | 'both';
export type AutomationTemplate =
  | 'stop_loss' | 'scale_up' | 'fatigue_control' | 'weekend_protection' | 'custom';

// ─── Condições compostas ─────────────────────────────────────────────────────

export interface RuleCondition {
  metric: MetricKey;
  operator: ConditionOperator;
  value: number;
  time_window: TimeWindow;
}

export interface ConditionGroup {
  logic: LogicOperator;
  conditions: RuleCondition[];
}

// ─── Ação ────────────────────────────────────────────────────────────────────

export interface RuleActionConfig {
  type: ActionType;
  budget_change_pct?: number;  // para increase/decrease_budget
  alert_message?: string;
}

// ─── Agendamento (Dayparting) ─────────────────────────────────────────────────

export interface DaypartingSchedule {
  days: number[];              // 0=Dom … 6=Sáb
  budget_multiplier: number;   // ex: 0.5 = reduz 50%
}

// ─── Snapshot de métricas ─────────────────────────────────────────────────────

export interface AdsMetricsSnapshot {
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  frequency?: number;
  ctr?: number;
  impressions?: number;
  clicks?: number;
  date_range: TimeWindow;
}

// ─── Entidade de Ads (campanha, adset, ad) ────────────────────────────────────

export interface AdsEntity {
  id: string;
  name: string;
  level: EntityLevel;
  platform: 'meta' | 'google';
  status: 'ACTIVE' | 'PAUSED';
  daily_budget?: number;
  metrics: AdsMetricsSnapshot;
}

// ─── Resultado de mutação ─────────────────────────────────────────────────────

export interface MutationResult {
  success: boolean;
  entity_id: string;
  action: string;
  mock_mode: boolean;
  error?: string;
}

// ─── Labels utilitários para UI ──────────────────────────────────────────────

export const METRIC_LABELS: Record<MetricKey, string> = {
  cpa: 'CPA (R$)', spend: 'Gasto (R$)', conversions: 'Conversões',
  roas: 'ROAS', frequency: 'Frequência', ctr: 'CTR (%)',
  impressions: 'Impressões', clicks: 'Cliques',
};

export const TIME_WINDOW_LABELS: Record<TimeWindow, string> = {
  today: 'Hoje', '3d': 'Últimos 3 dias', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias',
};

export const ACTION_LABELS: Record<ActionType, string> = {
  pause: 'Pausar entidade', enable: 'Ativar entidade',
  increase_budget: 'Aumentar orçamento', decrease_budget: 'Reduzir orçamento',
  alert: 'Enviar alerta',
};

export const ENTITY_LABELS: Record<EntityLevel, string> = {
  campaign: 'Campanha', adset: 'Conjunto de Anúncios', ad: 'Anúncio', account: 'Conta',
};

export const TEMPLATES: Record<AutomationTemplate, { name: string; description: string }> = {
  stop_loss:           { name: 'Stop-Loss Diário',            description: 'Para se gasto alto sem conversões' },
  scale_up:            { name: 'Escala Segura',               description: 'Aumenta orçamento quando CPA está bom' },
  fatigue_control:     { name: 'Controle de Fadiga',          description: 'Pausa anúncios com frequência alta e CTR baixo' },
  weekend_protection:  { name: 'Proteção de Fim de Semana',   description: 'Reduz orçamento nos fins de semana (B2B)' },
  custom:              { name: 'Regra Personalizada',         description: 'Configure suas próprias condições' },
};
