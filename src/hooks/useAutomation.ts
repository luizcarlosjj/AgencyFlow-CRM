'use client';

import { useState, useEffect, useCallback } from 'react';
import { automationRepository, automationLogsRepository, integrationTokensRepository } from '@/services/automationRepository';
import type { AutomationRule, AutomationLog, IntegrationToken } from '@/lib/types';

export function useAutomation(agencyId: string) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [tokens, setTokens] = useState<IntegrationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!agencyId) return;
    setLoading(true); setError(null);
    try {
      const [rulesData, logsData, tokensData] = await Promise.all([
        automationRepository.getAll(agencyId),
        automationLogsRepository.getByAgency(agencyId, 30).catch(() => []),
        integrationTokensRepository.getByAgency(agencyId).catch(() => []),
      ]);
      setRules(rulesData);
      setLogs(logsData);
      setTokens(tokensData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar automações');
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

  const disconnectToken = async (provider: string) => {
    await integrationTokensRepository.remove(agencyId, provider);
    setTokens((prev) => prev.filter((t) => t.provider !== provider));
  };

  return { rules, logs, tokens, loading, error, refetch: fetch, createRule, updateRule, removeRule, disconnectToken };
}
