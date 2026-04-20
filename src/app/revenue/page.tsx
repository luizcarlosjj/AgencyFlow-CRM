'use client';

import Header from '@/components/layout/Header';
import RevenueChart from '@/components/modules/RevenueChart';
import StatusBadge from '@/components/modules/StatusBadge';
import { mockRevenueLogs, mockClients, mockRevenueByMonth } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

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
      <Header title="Receita" subtitle="Faturamento e pagamentos da carteira" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto animate-page">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] text-white rounded-2xl shadow-lg shadow-orange-200 p-5 hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-xs font-semibold text-orange-100 uppercase tracking-wide">Receita Abril/26</p>
            <p className="text-2xl font-heading font-bold mt-1.5">{formatCurrency(currentTotal)}</p>
            <div className="flex items-center gap-1 mt-2">
              {growth >= 0 ? <TrendingUp className="w-3 h-3 text-orange-200" /> : <TrendingDown className="w-3 h-3 text-orange-200" />}
              <span className="text-xs text-orange-100">{growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs Março</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Meta do Mês</p>
            <p className="text-2xl font-heading font-bold mt-1.5 text-[#1F2937]">{formatCurrency(monthGoal)}</p>
            <div className="mt-2.5">
              <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6B00] rounded-full transition-all duration-500" style={{ width: `${goalProgress}%` }} />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">{goalProgress.toFixed(0)}% atingida</p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Pendentes</p>
            <p className="text-2xl font-heading font-bold mt-1.5 text-blue-600">
              {formatCurrency(currentMonth.filter((r) => r.status === 'pending').reduce((s, r) => s + r.value, 0))}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-2">{currentMonth.filter((r) => r.status === 'pending').length} notas fiscais</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Em Atraso</p>
            <p className="text-2xl font-heading font-bold mt-1.5 text-red-500">
              {formatCurrency(mockRevenueLogs.filter((r) => r.status === 'overdue').reduce((s, r) => s + r.value, 0))}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-2">{mockRevenueLogs.filter((r) => r.status === 'overdue').length} notas fiscais</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Histórico de Faturamento</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Receita mensal vs. metas — 6 meses</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0E6] rounded-xl border border-[#FFD4A8]">
              <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="text-xs font-semibold text-[#FF6B00]">Meta: {formatCurrency(monthGoal)}</span>
            </div>
          </div>
          <RevenueChart data={mockRevenueByMonth} />
        </div>

        {/* Client Revenue Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
          <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-5">Receita por Cliente</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {['Cliente', 'Receita Total (6m)', 'Último Mês', 'Status Pgto.', 'Participação'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientRevenueMap.map(({ client, total, latestLog }) => {
                  const totalAll = clientRevenueMap.reduce((s, x) => s + x.total, 0);
                  const share = totalAll > 0 ? (total / totalAll) * 100 : 0;
                  return (
                    <tr key={client.id} className="border-b border-[#F9FAFB] hover:bg-[#FFFAF7] transition-all duration-150 cursor-pointer">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#FF6B00] font-bold text-sm flex-shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#1F2937]">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#1F2937]">{formatCurrency(total)}</td>
                      <td className="py-4 px-4 text-[#6B7280]">
                        {latestLog ? `${formatCurrency(latestLog.value)} · ${formatDate(latestLog.date)}` : '—'}
                      </td>
                      <td className="py-4 px-4">
                        {latestLog ? <StatusBadge status={latestLog.status} /> : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden w-24">
                            <div className="h-full bg-[#FF6B00] rounded-full transition-all duration-500" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-[#9CA3AF] w-8">{share.toFixed(0)}%</span>
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
