import { createClient } from '@/lib/supabase/client';
import type { Client } from '@/lib/types';

export const clientRepository = {
  async getAll(agencyId: string): Promise<Client[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<Client, 'id' | 'agency_id' | 'created_at'>>): Promise<Client> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },
};
