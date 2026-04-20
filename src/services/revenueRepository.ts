import { supabase } from '@/lib/supabase';
import type { RevenueLog } from '@/lib/types';

export const revenueRepository = {
  async getByClient(clientId: string): Promise<RevenueLog[]> {
    const { data, error } = await supabase
      .from('revenue_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByMonth(agencyId: string, month: string): Promise<RevenueLog[]> {
    const { data, error } = await supabase
      .from('revenue_logs')
      .select('*, clients!inner(agency_id)')
      .eq('clients.agency_id', agencyId)
      .gte('date', `${month}-01`)
      .lt('date', `${month}-31`);
    if (error) throw error;
    return data;
  },

  async create(log: Omit<RevenueLog, 'id' | 'created_at'>): Promise<RevenueLog> {
    const { data, error } = await supabase
      .from('revenue_logs')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<RevenueLog>): Promise<RevenueLog> {
    const { data, error } = await supabase
      .from('revenue_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
