import { createClient } from '@/lib/supabase/client';
import type { AutomationRule } from '@/lib/types';

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
      .from('automation_rules')
      .insert(rule)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<AutomationRule, 'id' | 'created_at'>>): Promise<AutomationRule> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('automation_rules').delete().eq('id', id);
    if (error) throw error;
  },
};
