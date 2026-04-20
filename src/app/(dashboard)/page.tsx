'use client';

import { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, BarChart2, AlertCircle, Loader2 } from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useClients } from '@/hooks/useClients';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useRevenue } from '@/hooks/useRevenue';
import MetricCard from '@/components/modules/MetricCard';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export default function DashboardPage() {
  const { agency } = useAgencyContext();
  const { clients, loading: lc } = useClients(agency.id);
  const { campaigns, loading: lp } = useCampaigns(agency.id);
  const { logs, loading: lr } = useRevenue(agency.id);

  const loading = lc || lp || lr;

  const kpis = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === 'active').length;
    const totalRevenue = logs.filter((l) => l.status === 'paid').reduce((s, l) => s + l.value, 0);
    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
    return { activeClients, totalRevenue, totalSpend, activeCampaigns };
  }, [clients, campaigns, logs]);

  const chartData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    logs.filter((l) => l.status === 'paid').forEach((l) => {
      const month = l.date.slice(0, 7);
      byMonth[month] = (byMonth[month] ?? 0) + l.value;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue,
        meta: agency.settings.monthly_goal,
      }));
  }, [logs, agency.settings.monthly_goal]);

  const recentClients = useMemo(
    () => [...clients].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [clients],
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6 animate-page">
      <div>
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">Dashboard</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Visão geral da sua agência</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Receita Total" value={fmt(kpis.totalRevenue)} icon={DollarSign} accent />
        <MetricCard title="Clientes Ativos" value={String(kpis.activeClients)} icon={Users} />
        <MetricCard title="Investimento em Ads" value={fmt(kpis.totalSpend)} icon={BarChart2} />
        <MetricCard title="Campanhas Ativas" value={String(kpis.activeCampaigns)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
          <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Receita Mensal</h2>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#9CA3AF]">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">Nenhum dado de receita ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [fmt(Number(v)), 'Receita']} contentStyle={{ borderRadius: 12, border: '1px solid #F3F4F6', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
          <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Clientes Recentes</h2>
          {recentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-[#9CA3AF]">
              <AlertCircle className="w-6 h-6 mb-1" />
              <p className="text-xs">Nenhum cliente ainda</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentClients.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{c.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{fmt(c.monthly_fee)}/mês</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'active' ? 'bg-green-50 text-green-700' :
                    c.status === 'paused' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {c.status === 'active' ? 'Ativo' : c.status === 'paused' ? 'Pausado' : 'Cancelado'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
