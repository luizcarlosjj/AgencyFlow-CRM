'use client';

import { useState, useEffect, useCallback } from 'react';
import { campaignRepository } from '@/services/campaignRepository';
import type { Campaign } from '@/lib/types';

export function useCampaigns(agencyId: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!agencyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await campaignRepository.getAllByAgency(agencyId);
      setCampaigns(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createCampaign = async (data: Omit<Campaign, 'id' | 'cpa' | 'created_at'>) => {
    const created = await campaignRepository.create(data);
    setCampaigns((prev) => [created, ...prev]);
    return created;
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const updated = await campaignRepository.update(id, updates);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const removeCampaign = async (id: string) => {
    await campaignRepository.remove(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  return { campaigns, loading, error, refetch: fetch, createCampaign, updateCampaign, removeCampaign };
}
