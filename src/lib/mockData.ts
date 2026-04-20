import type { Client, Campaign, RevenueLog, AutomationRule, RevenueByMonth, DashboardKPIs } from './types';

const AGENCY_ID = 'mock-agency-001';

export const mockClients: Client[] = [
  { id: 'c1', agency_id: AGENCY_ID, name: 'Empresa Alpha', status: 'active', monthly_fee: 8500, contact_email: 'alpha@email.com', next_payment_date: '2026-05-01', created_at: '2025-10-01' },
  { id: 'c2', agency_id: AGENCY_ID, name: 'Beta Comércio', status: 'active', monthly_fee: 5200, contact_email: 'beta@email.com', next_payment_date: '2026-05-05', created_at: '2025-11-15' },
  { id: 'c3', agency_id: AGENCY_ID, name: 'Gamma Serviços', status: 'active', monthly_fee: 12000, contact_email: 'gamma@email.com', next_payment_date: '2026-05-10', created_at: '2025-09-20' },
  { id: 'c4', agency_id: AGENCY_ID, name: 'Delta Tech', status: 'paused', monthly_fee: 4800, contact_email: 'delta@email.com', next_payment_date: '2026-05-15', created_at: '2025-12-01' },
  { id: 'c5', agency_id: AGENCY_ID, name: 'Epsilon Moda', status: 'active', monthly_fee: 7300, contact_email: 'epsilon@email.com', next_payment_date: '2026-05-20', created_at: '2026-01-10' },
  { id: 'c6', agency_id: AGENCY_ID, name: 'Zeta Foods', status: 'churned', monthly_fee: 3500, contact_email: 'zeta@email.com', next_payment_date: undefined, created_at: '2025-08-01' },
];

export const mockCampaigns: Campaign[] = [
  { id: 'cam1', client_id: 'c1', name: 'Alpha — Google Search', platform: 'google', spend: 6800, conversions: 54, cpa: 125.93, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
  { id: 'cam2', client_id: 'c1', name: 'Alpha — Meta Reels', platform: 'meta', spend: 3200, conversions: 28, cpa: 114.29, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
  { id: 'cam3', client_id: 'c2', name: 'Beta — Google Display', platform: 'google', spend: 4100, conversions: 22, cpa: 186.36, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
  { id: 'cam4', client_id: 'c2', name: 'Beta — Meta Feed', platform: 'meta', spend: 2900, conversions: 41, cpa: 70.73, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
  { id: 'cam5', client_id: 'c3', name: 'Gamma — Google Pmax', platform: 'google', spend: 9200, conversions: 87, cpa: 105.75, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
  { id: 'cam6', client_id: 'c3', name: 'Gamma — Meta Stories', platform: 'meta', spend: 5600, conversions: 63, cpa: 88.89, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
  { id: 'cam7', client_id: 'c4', name: 'Delta — Google Search', platform: 'google', spend: 3100, conversions: 18, cpa: 172.22, status: 'paused', period_start: '2026-03-01', period_end: '2026-03-31', created_at: '2026-03-01' },
  { id: 'cam8', client_id: 'c5', name: 'Epsilon — Meta Reels', platform: 'meta', spend: 4800, conversions: 52, cpa: 92.31, status: 'active', period_start: '2026-04-01', period_end: '2026-04-30', created_at: '2026-04-01' },
];

export const mockRevenueLogs: RevenueLog[] = [
  // c1 Alpha
  { id: 'r1', client_id: 'c1', value: 8500, date: '2026-04-01', status: 'pending', created_at: '2026-04-01' },
  { id: 'r2', client_id: 'c1', value: 8500, date: '2026-03-01', status: 'paid', created_at: '2026-03-01' },
  { id: 'r3', client_id: 'c1', value: 8500, date: '2026-02-01', status: 'paid', created_at: '2026-02-01' },
  { id: 'r4', client_id: 'c1', value: 8500, date: '2026-01-01', status: 'paid', created_at: '2026-01-01' },
  { id: 'r5', client_id: 'c1', value: 8000, date: '2025-12-01', status: 'paid', created_at: '2025-12-01' },
  { id: 'r6', client_id: 'c1', value: 8000, date: '2025-11-01', status: 'paid', created_at: '2025-11-01' },
  // c2 Beta
  { id: 'r7', client_id: 'c2', value: 5200, date: '2026-04-01', status: 'paid', created_at: '2026-04-01' },
  { id: 'r8', client_id: 'c2', value: 5200, date: '2026-03-01', status: 'paid', created_at: '2026-03-01' },
  { id: 'r9', client_id: 'c2', value: 5200, date: '2026-02-01', status: 'paid', created_at: '2026-02-01' },
  { id: 'r10', client_id: 'c2', value: 5000, date: '2026-01-01', status: 'paid', created_at: '2026-01-01' },
  { id: 'r11', client_id: 'c2', value: 5000, date: '2025-12-01', status: 'paid', created_at: '2025-12-01' },
  { id: 'r12', client_id: 'c2', value: 5000, date: '2025-11-01', status: 'paid', created_at: '2025-11-01' },
  // c3 Gamma
  { id: 'r13', client_id: 'c3', value: 12000, date: '2026-04-01', status: 'paid', created_at: '2026-04-01' },
  { id: 'r14', client_id: 'c3', value: 12000, date: '2026-03-01', status: 'paid', created_at: '2026-03-01' },
  { id: 'r15', client_id: 'c3', value: 12000, date: '2026-02-01', status: 'paid', created_at: '2026-02-01' },
  { id: 'r16', client_id: 'c3', value: 11500, date: '2026-01-01', status: 'paid', created_at: '2026-01-01' },
  { id: 'r17', client_id: 'c3', value: 11500, date: '2025-12-01', status: 'paid', created_at: '2025-12-01' },
  { id: 'r18', client_id: 'c3', value: 11000, date: '2025-11-01', status: 'paid', created_at: '2025-11-01' },
  // c4 Delta
  { id: 'r19', client_id: 'c4', value: 4800, date: '2026-03-01', status: 'paid', created_at: '2026-03-01' },
  { id: 'r20', client_id: 'c4', value: 4800, date: '2026-02-01', status: 'paid', created_at: '2026-02-01' },
  { id: 'r21', client_id: 'c4', value: 4800, date: '2026-01-01', status: 'paid', created_at: '2026-01-01' },
  // c5 Epsilon
  { id: 'r22', client_id: 'c5', value: 7300, date: '2026-04-01', status: 'paid', created_at: '2026-04-01' },
  { id: 'r23', client_id: 'c5', value: 7300, date: '2026-03-01', status: 'paid', created_at: '2026-03-01' },
  { id: 'r24', client_id: 'c5', value: 7300, date: '2026-02-01', status: 'paid', created_at: '2026-02-01' },
  { id: 'r25', client_id: 'c5', value: 7000, date: '2026-01-01', status: 'paid', created_at: '2026-01-01' },
];

export const mockAutomationRules: AutomationRule[] = [
  { id: 'rule1', agency_id: AGENCY_ID, name: 'CPA Alto — Google', metric: 'cpa', operator: '>', threshold: 150, action: 'alert', is_active: true, created_at: '2026-01-01' },
  { id: 'rule2', agency_id: AGENCY_ID, name: 'Gasto Elevado — Meta', metric: 'spend', operator: '>', threshold: 6000, action: 'alert', is_active: true, created_at: '2026-01-01' },
  { id: 'rule3', agency_id: AGENCY_ID, name: 'Conversões Baixas', metric: 'conversions', operator: '<', threshold: 10, action: 'alert', is_active: false, created_at: '2026-02-01' },
];

export const mockRevenueByMonth: RevenueByMonth[] = [
  { month: 'Nov/25', revenue: 32500, goal: 60000 },
  { month: 'Dez/25', revenue: 37800, goal: 65000 },
  { month: 'Jan/26', revenue: 41300, goal: 65000 },
  { month: 'Fev/26', revenue: 45600, goal: 70000 },
  { month: 'Mar/26', revenue: 47500, goal: 75000 },
  { month: 'Abr/26', revenue: 33000, goal: 80000 },
];

export const mockDashboardKPIs: DashboardKPIs = {
  totalRevenue: 33000,
  activeClients: 4,
  totalAdSpend: 39700,
  avgROI: 3.2,
  revenueGrowth: -30.5,
};
