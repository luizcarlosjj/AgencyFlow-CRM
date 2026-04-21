// ─── Domain Types ────────────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'paused' | 'churned';
export type CampaignStatus = 'active' | 'paused' | 'ended';
export type Platform = 'google' | 'meta';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type RuleMetric = 'cpa' | 'spend' | 'conversions';
export type RuleOperator = '>' | '<' | '==';
export type RuleAction = 'alert' | 'pause';

// Importa e re-exporta compound types do motor de regras
import type {
  ConditionGroup, RuleCondition, RuleActionConfig, DaypartingSchedule,
  AdsPlatform, EntityLevel, AutomationTemplate, MetricKey, ActionType,
} from '@/services/ads/types';

export type {
  ConditionGroup, RuleCondition, RuleActionConfig, DaypartingSchedule,
  AdsPlatform, EntityLevel, AutomationTemplate, MetricKey, ActionType,
};

export interface Agency {
  id: string;
  name: string;
  logo?: string;
  settings: {
    currency: string;
    monthly_goal: number;
  };
  created_at: string;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  status: ClientStatus;
  monthly_fee: number;
  contact_email?: string;
  next_payment_date?: string;
  google_customer_id?: string;
  meta_ad_account_id?: string;
  created_at: string;
}

export interface LiveCampaign {
  external_id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'ACTIVE' | 'REMOVED';
  platform: 'google' | 'meta';
  daily_budget: number;
  budget_resource?: string;
}

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  platform: Platform;
  spend: number;
  conversions: number;
  cpa: number;
  status: CampaignStatus;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

export interface RevenueLog {
  id: string;
  client_id: string;
  value: number;
  date: string;
  status: PaymentStatus;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  agency_id: string;
  name: string;
  description?: string;
  // Campos legados (regras simples)
  metric?: RuleMetric;
  operator?: RuleOperator;
  threshold?: number;
  action?: RuleAction;
  // Campos compostos (novo motor)
  platform?: AdsPlatform;
  entity_level?: EntityLevel;
  condition_group?: ConditionGroup;
  action_config?: RuleActionConfig;
  template?: AutomationTemplate;
  schedule?: DaypartingSchedule;
  client_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  rule_id?: string;
  agency_id: string;
  rule_name: string;
  platform?: string;
  entity_id?: string;
  entity_name?: string;
  entity_level?: string;
  metrics_snapshot?: Record<string, number>;
  conditions_met: boolean;
  action_taken?: string;
  success: boolean;
  error_message?: string;
  mock_mode: boolean;
  created_at: string;
}

export interface IntegrationToken {
  id: string;
  agency_id: string;
  provider: 'meta' | 'google_ads';
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  account_id?: string;
  account_name?: string;
  created_at: string;
  updated_at: string;
}

// ─── Ads API Interfaces (ready for real Google/Meta integration) ──────────────
// These match the shape of what the real APIs return after normalization.

export interface AdsMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  cpa: number;
  ctr: number;
  roas: number;
}

export interface AdsCampaign {
  id: string;
  externalId: string;      // Google/Meta campaign ID
  platform: Platform;
  name: string;
  status: CampaignStatus;
  metrics: AdsMetrics;
  period: { start: string; end: string };
}

// ─── Aggregated / View Types ─────────────────────────────────────────────────

export interface RevenueByMonth {
  month: string;  // 'YYYY-MM'
  revenue: number;
  goal: number;
}

export interface DashboardKPIs {
  totalRevenue: number;
  activeClients: number;
  totalAdSpend: number;
  avgROI: number;
  revenueGrowth: number;   // % vs last month
}
