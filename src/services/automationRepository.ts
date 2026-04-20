import { supabase } from '@/lib/supabase';
import type { AutomationRule } from '@/lib/types';

export const automationRepository = {
  async getAll(agencyId: string): Promise<AutomationRule[]> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(rule: Omit<AutomationRule, 'id' | 'created_at'>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert(rule)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
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
    const { error } = await supabase.from('automation_rules').delete().eq('id', id);
    if (error) throw error;
  },
};
