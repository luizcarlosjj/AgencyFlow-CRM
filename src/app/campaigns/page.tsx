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
      <Header title="Campanhas" subtitle="Vista unificada Google Ads + Meta Ads" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Gasto Total', value: formatCurrency(totalSpend), highlight: false },
            { label: 'Total Conversões', value: totalConversions.toString(), highlight: false },
            { label: 'CPA Médio', value: formatCurrency(avgCpa), highlight: avgCpa > CPA_THRESHOLD },
            { label: 'Alertas CPA', value: alertCount.toString(), highlight: alertCount > 0 },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <p className="text-sm text-[#6B7280]">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.highlight ? 'text-red-600' : 'text-[#1F2937]'}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Kanban-style platform columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(['google', 'meta'] as Platform[]).map((platform) => {
            const platformCampaigns = mockCampaigns.filter((c) => c.platform === platform);
            return (
              <div key={platform} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-4">
                  <PlatformBadge platform={platform} />
                  <span className="text-sm text-[#6B7280]">{platformCampaigns.length} campanhas</span>
                </div>
                <div className="space-y-3">
                  {platformCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        c.cpa > CPA_THRESHOLD ? 'border-red-200 bg-red-50' : 'border-[#F3F4F6] bg-[#F9FAFB] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-[#1F2937] text-sm">{c.name}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{clientMap[c.client_id]}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div>
                          <p className="text-xs text-[#6B7280]">Gasto</p>
                          <p className="text-sm font-semibold text-[#1F2937]">{formatCurrency(c.spend)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280]">Conversões</p>
                          <p className="text-sm font-semibold text-[#1F2937]">{c.conversions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280]">CPA</p>
                          <p className={`text-sm font-bold ${c.cpa > CPA_THRESHOLD ? 'text-red-600' : 'text-emerald-600'}`}>
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
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#1F2937]">Todas as Campanhas</h2>
            <div className="flex items-center gap-2">
              {(['all', 'google', 'meta'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    platformFilter === p ? 'bg-[#FF6B00] text-white' : 'bg-[#F9FAFB] text-[#6B7280] hover:text-[#FF6B00]'
                  }`}
                >
                  {p === 'all' ? 'Todos' : p === 'google' ? 'Google' : 'Meta'}
                </button>
              ))}
              <div className="relative ml-2">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 w-40"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Campanha', 'Cliente', 'Plataforma', 'Gasto', 'Conversões', 'CPA', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`border-b border-[#F3F4F6] transition-colors ${c.cpa > CPA_THRESHOLD ? 'bg-red-50/40' : 'hover:bg-[#F9FAFB]'}`}>
                    <td className="py-3 px-4 font-medium text-[#1F2937]">{c.name}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{clientMap[c.client_id]}</td>
                    <td className="py-3 px-4"><PlatformBadge platform={c.platform} /></td>
                    <td className="py-3 px-4 text-[#1F2937]">{formatCurrency(c.spend)}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{c.conversions}</td>
                    <td className={`py-3 px-4 font-semibold ${c.cpa > CPA_THRESHOLD ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(c.cpa)}</td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-[#6B7280] text-sm">Nenhuma campanha encontrada.</div>
            )}
          </div>
        </div>

      </main>
    </>
  );
}
