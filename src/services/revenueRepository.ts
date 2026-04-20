import { createClient } from '@/lib/supabase/client';
import type { RevenueLog } from '@/lib/types';

export const revenueRepository = {
  async getAllByAgency(agencyId: string): Promise<RevenueLog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('revenue_logs')
      .select('*, clients!inner(agency_id)')
      .eq('clients.agency_id', agencyId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(({ clients: _c, ...r }) => r as RevenueLog);
  },

  async create(log: Omit<RevenueLog, 'id' | 'created_at'>): Promise<RevenueLog> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('revenue_logs')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<RevenueLog, 'id' | 'created_at'>>): Promise<RevenueLog> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('revenue_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('revenue_logs').delete().eq('id', id);
    if (error) throw error;
  },
};
