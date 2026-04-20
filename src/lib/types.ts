// ─── Domain Types ────────────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'paused' | 'churned';
export type CampaignStatus = 'active' | 'paused' | 'ended';
export type Platform = 'google' | 'meta';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type RuleMetric = 'cpa' | 'spend' | 'conversions';
export type RuleOperator = '>' | '<' | '==';
export type RuleAction = 'alert' | 'pause';

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
  created_at: string;
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
  metric: RuleMetric;
  operator: RuleOperator;
  threshold: number;
  action: RuleAction;
  is_active: boolean;
  created_at: string;
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
