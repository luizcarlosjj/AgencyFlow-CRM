import { createClient } from '@/lib/supabase/client';
import type { AutomationRule, AutomationLog, IntegrationToken } from '@/lib/types';

// ─── Regras ───────────────────────────────────────────────────────────────────

export const automationRepository = {
  async getAll(agencyId: string): Promise<AutomationRule[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(rule: Omit<AutomationRule, 'id' | 'created_at'>): Promise<AutomationRule> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_rules').insert(rule).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<AutomationRule, 'id' | 'created_at'>>): Promise<AutomationRule> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_rules').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('automation_rules').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Logs de execução ─────────────────────────────────────────────────────────

export const automationLogsRepository = {
  async getByAgency(agencyId: string, limit = 50): Promise<AutomationLog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async create(log: Omit<AutomationLog, 'id' | 'created_at'>): Promise<AutomationLog> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_logs').insert(log).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── Tokens de integração ─────────────────────────────────────────────────────

export const integrationTokensRepository = {
  async getByAgency(agencyId: string): Promise<IntegrationToken[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('integration_tokens')
      .select('id, agency_id, provider, access_token, refresh_token, account_id, account_name, expires_at, created_at, updated_at')
      .eq('agency_id', agencyId);
    if (error) throw error;
    return data ?? [];
  },

  async upsert(token: Omit<IntegrationToken, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('integration_tokens')
      .upsert({ ...token, updated_at: new Date().toISOString() }, { onConflict: 'agency_id,provider' });
    if (error) throw error;
  },

  async remove(agencyId: string, provider: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('integration_tokens').delete().eq('agency_id', agencyId).eq('provider', provider);
    if (error) throw error;
  },
};
