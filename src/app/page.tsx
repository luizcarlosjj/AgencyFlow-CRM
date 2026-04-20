import Header from '@/components/layout/Header';
import MetricCard from '@/components/modules/MetricCard';
import RevenueChart from '@/components/modules/RevenueChart';
import StatusBadge from '@/components/modules/StatusBadge';
import PlatformBadge from '@/components/modules/PlatformBadge';
import { mockDashboardKPIs, mockRevenueByMonth, mockClients, mockCampaigns } from '@/lib/mockData';
import { DollarSign, Users, Megaphone, TrendingUp, AlertTriangle } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

const alerts = [
  { id: 1, message: 'CPA de Beta Comércio — Google Display subiu para R$186', severity: 'high', campaign: 'Beta — Google Display' },
  { id: 2, message: 'Gasto da Gamma Serviços — Meta Stories próximo do limite', severity: 'medium', campaign: 'Gamma — Meta Stories' },
];

export default function DashboardPage() {
  const kpis = mockDashboardKPIs;
  const topCampaigns = mockCampaigns.filter((c) => c.status === 'active').slice(0, 5);

  return (
    <>
      <Header title="Dashboard" subtitle="Visão geral da agência — Abril 2026" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Receita Mensal"
            value={formatCurrency(kpis.totalRevenue)}
            change={kpis.revenueGrowth}
            icon={DollarSign}
            accent
          />
          <MetricCard
            title="Clientes Activos"
            value={String(kpis.activeClients)}
            change={0}
            changeLabel="estável"
            icon={Users}
          />
          <MetricCard
            title="Gasto em Anúncios"
            value={formatCurrency(kpis.totalAdSpend)}
            change={4.2}
            icon={Megaphone}
          />
          <MetricCard
            title="ROI Médio"
            value={`${kpis.avgROI.toFixed(1)}x`}
            change={0.3}
            icon={TrendingUp}
          />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1F2937]">Faturação Mensal</h2>
                <p className="text-sm text-[#6B7280]">Receita vs. Meta dos últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#FF6B00] inline-block rounded" />
                  Receita
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#FFB380] inline-block rounded" />
                  Meta
                </span>
              </div>
            </div>
            <RevenueChart data={mockRevenueByMonth} />
          </div>

          {/* Alerts + Status */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#1F2937]">Alertas Activos</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                  }`}
                >
                  <div className="flex gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                      <p className="text-sm text-[#1F2937] font-medium leading-tight">{alert.message}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{alert.campaign}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <h3 className="text-sm font-semibold text-[#1F2937]">Clientes por Status</h3>
              {(['active', 'paused', 'churned'] as const).map((s) => {
                const count = mockClients.filter((c) => c.status === s).length;
                return (
                  <div key={s} className="flex items-center justify-between">
                    <StatusBadge status={s} />
                    <span className="text-sm font-semibold text-[#1F2937]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Campaigns Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-base font-semibold text-[#1F2937] mb-4">Campanhas em Destaque</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Campanha', 'Plataforma', 'Gasto', 'Conversões', 'CPA', 'Status'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c) => (
                  <tr key={c.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#1F2937]">{c.name}</td>
                    <td className="py-3 px-3"><PlatformBadge platform={c.platform} /></td>
                    <td className="py-3 px-3 text-[#1F2937]">{formatCurrency(c.spend)}</td>
                    <td className="py-3 px-3 text-[#1F2937]">{c.conversions}</td>
                    <td className={`py-3 px-3 font-semibold ${c.cpa > 150 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(c.cpa)}</td>
                    <td className="py-3 px-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  );
}
