'use client';

import { useState, useEffect, useCallback } from 'react';
import { automationRepository } from '@/services/automationRepository';
import type { AutomationRule } from '@/lib/types';

export function useAutomation(agencyId: string) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!agencyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await automationRepository.getAll(agencyId);
      setRules(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar regras');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createRule = async (data: Omit<AutomationRule, 'id' | 'created_at'>) => {
    const created = await automationRepository.create(data);
    setRules((prev) => [created, ...prev]);
    return created;
  };

  const updateRule = async (id: string, updates: Partial<AutomationRule>) => {
    const updated = await automationRepository.update(id, updates);
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const removeRule = async (id: string) => {
    await automationRepository.remove(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return { rules, loading, error, refetch: fetch, createRule, updateRule, removeRule };
}
