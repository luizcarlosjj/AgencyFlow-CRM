'use client';

import { useState, useEffect, useCallback } from 'react';
import { revenueRepository } from '@/services/revenueRepository';
import type { RevenueLog } from '@/lib/types';

export function useRevenue(agencyId: string) {
  const [logs, setLogs] = useState<RevenueLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!agencyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await revenueRepository.getAllByAgency(agencyId);
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createLog = async (data: Omit<RevenueLog, 'id' | 'created_at'>) => {
    const created = await revenueRepository.create(data);
    setLogs((prev) => [created, ...prev]);
    return created;
  };

  const updateLog = async (id: string, updates: Partial<RevenueLog>) => {
    const updated = await revenueRepository.update(id, updates);
    setLogs((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const removeLog = async (id: string) => {
    await revenueRepository.remove(id);
    setLogs((prev) => prev.filter((r) => r.id !== id));
  };

  return { logs, loading, error, refetch: fetch, createLog, updateLog, removeLog };
}
