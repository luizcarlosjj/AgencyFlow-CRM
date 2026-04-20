'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/modules/StatusBadge';
import PlatformBadge from '@/components/modules/PlatformBadge';
import { mockCampaigns, mockClients } from '@/lib/mockData';
import type { Platform } from '@/lib/types';
import { Search } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

const CPA_THRESHOLD = 150;

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');

  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]));

  const filtered = mockCampaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (clientMap[c.client_id] ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const totalSpend = mockCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalConversions = mockCampaigns.reduce((s, c) => s + c.conversions, 0);
  const avgCpa = totalSpend / (totalConversions || 1);
  const alertCount = mockCampaigns.filter((c) => c.cpa > CPA_THRESHOLD).length;

  return (
    <>
      <Header title="Campanhas" subtitle="Visão unificada Google Ads + Meta Ads" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto animate-page">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Gasto Total', value: formatCurrency(totalSpend), highlight: false },
            { label: 'Total de Conversões', value: totalConversions.toString(), highlight: false },
            { label: 'CPA Médio', value: formatCurrency(avgCpa), highlight: avgCpa > CPA_THRESHOLD },
            { label: 'Alertas de CPA', value: alertCount.toString(), highlight: alertCount > 0 },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{item.label}</p>
              <p className={`text-2xl font-heading font-bold mt-1.5 ${item.highlight ? 'text-red-500' : 'text-[#1F2937]'}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Kanban-style platform columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(['google', 'meta'] as Platform[]).map((platform) => {
            const platformCampaigns = mockCampaigns.filter((c) => c.platform === platform);
            return (
              <div key={platform} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <PlatformBadge platform={platform} />
                  <span className="text-xs font-medium text-[#9CA3AF]">{platformCampaigns.length} campanhas</span>
                </div>
                <div className="space-y-3">
                  {platformCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:-translate-y-px ${
                        c.cpa > CPA_THRESHOLD
                          ? 'border-red-200 bg-red-50 hover:bg-red-50'
                          : 'border-[#F3F4F6] bg-[#F9FAFB] hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[#1F2937] text-sm">{c.name}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{clientMap[c.client_id]}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Gasto</p>
                          <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{formatCurrency(c.spend)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Conversões</p>
                          <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{c.conversions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">CPA</p>
                          <p className={`text-sm font-bold mt-0.5 ${c.cpa > CPA_THRESHOLD ? 'text-red-500' : 'text-emerald-600'}`}>
                            {formatCurrency(c.cpa)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between gap-3">
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">Todas as Campanhas</h2>
            <div className="flex items-center gap-2">
              {(['all', 'google', 'meta'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    platformFilter === p
                      ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-200'
                      : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#FFF0E6] hover:text-[#FF6B00]'
                  }`}
                >
                  {p === 'all' ? 'Todos' : p === 'google' ? 'Google' : 'Meta'}
                </button>
              ))}
              <div className="relative ml-2">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] focus:bg-white w-40 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {['Campanha', 'Cliente', 'Plataforma', 'Gasto', 'Conversões', 'CPA', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#F9FAFB] transition-all duration-150 cursor-pointer ${
                      c.cpa > CPA_THRESHOLD ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-[#FFFAF7]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-[#1F2937]">{c.name}</td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{clientMap[c.client_id]}</td>
                    <td className="py-3.5 px-4"><PlatformBadge platform={c.platform} /></td>
                    <td className="py-3.5 px-4 text-[#374151]">{formatCurrency(c.spend)}</td>
                    <td className="py-3.5 px-4 text-[#374151]">{c.conversions}</td>
                    <td className={`py-3.5 px-4 font-semibold ${c.cpa > CPA_THRESHOLD ? 'text-red-500' : 'text-emerald-600'}`}>{formatCurrency(c.cpa)}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[#9CA3AF] text-sm">Nenhuma campanha encontrada.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  );
}
