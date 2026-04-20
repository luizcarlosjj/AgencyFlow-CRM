'use client';

import Header from '@/components/layout/Header';
import RevenueChart from '@/components/modules/RevenueChart';
import StatusBadge from '@/components/modules/StatusBadge';
import { mockRevenueLogs, mockClients, mockRevenueByMonth } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export default function RevenuePage() {
  const currentMonth = mockRevenueLogs.filter((r) => r.date.startsWith('2026-04'));
  const lastMonth = mockRevenueLogs.filter((r) => r.date.startsWith('2026-03'));

  const currentTotal = currentMonth.reduce((s, r) => s + r.value, 0);
  const lastTotal = lastMonth.reduce((s, r) => s + r.value, 0);
  const growth = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

  const monthGoal = 80000;
  const goalProgress = Math.min((currentTotal / monthGoal) * 100, 100);

  const clientRevenueMap = mockClients.map((client) => {
    const logs = mockRevenueLogs.filter((r) => r.client_id === client.id);
    const total = logs.reduce((s, r) => s + r.value, 0);
    const latestLog = logs.sort((a, b) => b.date.localeCompare(a.date))[0];
    return { client, total, latestLog };
  }).sort((a, b) => b.total - a.total);

  return (
    <>
      <Header title="Receita" subtitle="Faturação e pagamentos da carteira" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FF6B00] text-white rounded-xl p-5">
            <p className="text-sm text-orange-100">Receita Abril/26</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(currentTotal)}</p>
            <div className="flex items-center gap-1 mt-2">
              {growth >= 0 ? <TrendingUp className="w-3 h-3 text-orange-200" /> : <TrendingDown className="w-3 h-3 text-orange-200" />}
              <span className="text-xs text-orange-100">{growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs Março</span>
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <p className="text-sm text-[#6B7280]">Meta do Mês</p>
            <p className="text-2xl font-bold mt-1 text-[#1F2937]">{formatCurrency(monthGoal)}</p>
            <div className="mt-2">
              <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6B00] rounded-full transition-all" style={{ width: `${goalProgress}%` }} />
              </div>
              <p className="text-xs text-[#6B7280] mt-1">{goalProgress.toFixed(0)}% atingida</p>
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <p className="text-sm text-[#6B7280]">Pendentes</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {formatCurrency(currentMonth.filter((r) => r.status === 'pending').reduce((s, r) => s + r.value, 0))}
            </p>
            <p className="text-xs text-[#6B7280] mt-2">{currentMonth.filter((r) => r.status === 'pending').length} facturas</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <p className="text-sm text-[#6B7280]">Atrasados</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {formatCurrency(mockRevenueLogs.filter((r) => r.status === 'overdue').reduce((s, r) => s + r.value, 0))}
            </p>
            <p className="text-xs text-[#6B7280] mt-2">{mockRevenueLogs.filter((r) => r.status === 'overdue').length} facturas</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1F2937]">Histórico de Faturação</h2>
              <p className="text-sm text-[#6B7280]">Receita mensal vs. metas — 6 meses</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF0E6] rounded-lg">
              <Target className="w-4 h-4 text-[#FF6B00]" />
              <span className="text-sm font-medium text-[#FF6B00]">Meta: {formatCurrency(monthGoal)}</span>
            </div>
          </div>
          <RevenueChart data={mockRevenueByMonth} />
        </div>

        {/* Client Revenue Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-base font-semibold text-[#1F2937] mb-4">Receita por Cliente</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Cliente', 'Receita Total (6m)', 'Último Mês', 'Status Pgmt', 'Participação'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientRevenueMap.map(({ client, total, latestLog }) => {
                  const totalAll = clientRevenueMap.reduce((s, x) => s + x.total, 0);
                  const share = totalAll > 0 ? (total / totalAll) * 100 : 0;
                  return (
                    <tr key={client.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center text-[#FF6B00] font-bold text-sm">
                            {client.name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#1F2937]">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1F2937]">{formatCurrency(total)}</td>
                      <td className="py-3.5 px-4 text-[#6B7280]">
                        {latestLog ? `${formatCurrency(latestLog.value)} · ${formatDate(latestLog.date)}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {latestLog ? <StatusBadge status={latestLog.status} /> : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden w-20">
                            <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-[#6B7280]">{share.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  );
}
