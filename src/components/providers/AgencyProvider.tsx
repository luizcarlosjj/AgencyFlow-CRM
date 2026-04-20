'use client';

import { createContext, useContext } from 'react';
import type { Agency } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface AgencyContextValue {
  agency: Agency;
  user: User;
}

const AgencyContext = createContext<AgencyContextValue | null>(null);

export function AgencyProvider({
  agency,
  user,
  children,
}: {
  agency: Agency;
  user: User;
  children: React.ReactNode;
}) {
  return (
    <AgencyContext.Provider value={{ agency, user }}>
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgencyContext(): AgencyContextValue {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error('useAgencyContext deve ser usado dentro de AgencyProvider');
  return ctx;
}
