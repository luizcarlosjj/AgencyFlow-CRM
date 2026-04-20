import { supabase } from '@/lib/supabase';
import type { Campaign } from '@/lib/types';

export const campaignRepository = {
  async getByClient(clientId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll(agencyId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, clients!inner(agency_id)')
      .eq('clients.agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(campaign: Omit<Campaign, 'id' | 'cpa' | 'created_at'>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<Campaign, 'cpa'>>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
