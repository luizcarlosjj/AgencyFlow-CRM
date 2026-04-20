import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import { AgencyProvider } from '@/components/providers/AgencyProvider';
import type { Agency } from '@/lib/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/login');

  // Busca ou cria a agência do usuário
  let { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    const { data: newAgency } = await supabase
      .from('agencies')
      .insert({
        owner_id: user.id,
        name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Minha Agência',
        settings: { currency: 'BRL', monthly_goal: 50000 },
      })
      .select()
      .single();
    agency = newAgency;
  }

  if (!agency) redirect('/login');

  return (
    <AgencyProvider agency={agency as Agency} user={user}>
      <div className="flex min-h-screen">
        <Sidebar
          userName={user.user_metadata?.full_name ?? user.email ?? 'Usuário'}
          userEmail={user.email ?? ''}
          agencyName={agency.name}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {children}
        </div>
      </div>
    </AgencyProvider>
  );
}
