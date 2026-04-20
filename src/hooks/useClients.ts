'use client';

import { useState, useEffect, useCallback } from 'react';
import { clientRepository } from '@/services/clientRepository';
import type { Client } from '@/lib/types';

export function useClients(agencyId: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!agencyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await clientRepository.getAll(agencyId);
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createClient = async (data: Omit<Client, 'id' | 'created_at'>) => {
    const created = await clientRepository.create(data);
    setClients((prev) => [created, ...prev]);
    return created;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const updated = await clientRepository.update(id, updates);
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const removeClient = async (id: string) => {
    await clientRepository.remove(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return { clients, loading, error, refetch: fetch, createClient, updateClient, removeClient };
}
