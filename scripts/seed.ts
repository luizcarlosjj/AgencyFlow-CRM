/**
 * Seed script — populates Supabase with realistic test data.
 * Usage: npm run seed
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting seed...');

  // Agency
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .insert({ name: 'AgencyFlow Demo', settings: { currency: 'BRL', monthly_goal: 80000 } })
    .select()
    .single();

  if (agencyError) throw agencyError;
  console.log('✅ Agency created:', agency.id);

  // Clients
  const clientsData = [
    { agency_id: agency.id, name: 'Empresa Alpha', status: 'active', monthly_fee: 8500, contact_email: 'alpha@email.com', next_payment_date: '2026-05-01' },
    { agency_id: agency.id, name: 'Beta Comércio', status: 'active', monthly_fee: 5200, contact_email: 'beta@email.com', next_payment_date: '2026-05-05' },
    { agency_id: agency.id, name: 'Gamma Serviços', status: 'active', monthly_fee: 12000, contact_email: 'gamma@email.com', next_payment_date: '2026-05-10' },
    { agency_id: agency.id, name: 'Delta Tech', status: 'paused', monthly_fee: 4800, contact_email: 'delta@email.com', next_payment_date: '2026-05-15' },
    { agency_id: agency.id, name: 'Epsilon Moda', status: 'active', monthly_fee: 7300, contact_email: 'epsilon@email.com', next_payment_date: '2026-05-20' },
    { agency_id: agency.id, name: 'Zeta Foods', status: 'churned', monthly_fee: 3500, contact_email: 'zeta@email.com', next_payment_date: null },
  ];

  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .insert(clientsData)
    .select();

  if (clientsError) throw clientsError;
  console.log(`✅ ${clients.length} clients created`);

  // Campaigns
  const campaignsData = clients.flatMap((client) => [
    {
      client_id: client.id,
      name: `${client.name} — Google Search`,
      platform: 'google',
      spend: Math.round(Math.random() * 8000 + 2000),
      conversions: Math.round(Math.random() * 80 + 20),
      status: client.status === 'active' ? 'active' : 'paused',
      period_start: '2026-04-01',
      period_end: '2026-04-30',
    },
    {
      client_id: client.id,
      name: `${client.name} — Meta Reels`,
      platform: 'meta',
      spend: Math.round(Math.random() * 5000 + 1000),
      conversions: Math.round(Math.random() * 60 + 10),
      status: client.status === 'active' ? 'active' : 'paused',
      period_start: '2026-04-01',
      period_end: '2026-04-30',
    },
  ]);

  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .insert(campaignsData)
    .select();

  if (campaignsError) throw campaignsError;
  console.log(`✅ ${campaigns.length} campaigns created`);

  // Revenue logs — last 6 months
  const months = ['2025-11-01', '2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01'];
  const revenueData = clients.flatMap((client) =>
    months.map((date, i) => ({
      client_id: client.id,
      value: client.monthly_fee * (0.85 + Math.random() * 0.3),
      date,
      status: i < 5 ? 'paid' : 'pending',
    }))
  );

  const { error: revenueError } = await supabase.from('revenue_logs').insert(revenueData);
  if (revenueError) throw revenueError;
  console.log(`✅ ${revenueData.length} revenue logs created`);

  // Automation rules
  const rulesData = [
    { agency_id: agency.id, name: 'CPA Alto — Google', metric: 'cpa', operator: '>', threshold: 150, action: 'alert', is_active: true },
    { agency_id: agency.id, name: 'Gasto Elevado — Meta', metric: 'spend', operator: '>', threshold: 6000, action: 'alert', is_active: true },
    { agency_id: agency.id, name: 'Conversões Baixas', metric: 'conversions', operator: '<', threshold: 10, action: 'alert', is_active: false },
  ];

  const { error: rulesError } = await supabase.from('automation_rules').insert(rulesData);
  if (rulesError) throw rulesError;
  console.log(`✅ ${rulesData.length} automation rules created`);

  console.log('\n🎉 Seed completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
