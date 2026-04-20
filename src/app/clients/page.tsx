'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/modules/StatusBadge';
import { mockClients } from '@/lib/mockData';
import type { ClientStatus } from '@/lib/types';
import { Search, UserPlus, ChevronRight } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

const statusFilters: { value: 'all' | ClientStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'churned', label: 'Cancelados' },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');

  const filtered = mockClients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMRR = mockClients.filter((c) => c.status === 'active').reduce((s, c) => s + c.monthly_fee, 0);

  return (
    <>
      <Header
        title="Clientes"
        subtitle={`${mockClients.filter((c) => c.status === 'active').length} ativos · MRR ${formatCurrency(totalMRR)}`}
      />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto animate-page">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total de Clientes', value: mockClients.length, color: 'text-[#1F2937]' },
            { label: 'MRR Total', value: formatCurrency(totalMRR), color: 'text-[#FF6B00]' },
            {
              label: 'Taxa de Cancelamento',
              value: `${((mockClients.filter(c => c.status === 'churned').length / mockClients.length) * 100).toFixed(0)}%`,
              color: 'text-red-500',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{item.label}</p>
              <p className={`text-2xl font-heading font-bold mt-1.5 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="p-4 border-b border-[#F3F4F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    statusFilter === f.value
                      ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-200'
                      : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#FFF0E6] hover:text-[#FF6B00]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] focus:bg-white w-44 transition-all duration-200"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-medium shadow-md shadow-orange-200 hover:bg-[#e65c00] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <UserPlus className="w-4 h-4" />
                Novo Cliente
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {['Cliente', 'Status', 'Mensalidade', 'Próx. Pagamento', 'Contato', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="border-b border-[#F9FAFB] hover:bg-[#FFFAF7] transition-all duration-150 cursor-pointer group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#FF6B00] font-bold text-sm flex-shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <span className="font-medium text-[#1F2937]">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4"><StatusBadge status={client.status} /></td>
                    <td className="py-4 px-4 font-semibold text-[#1F2937]">{formatCurrency(client.monthly_fee)}</td>
                    <td className="py-4 px-4 text-[#6B7280]">{formatDate(client.next_payment_date)}</td>
                    <td className="py-4 px-4 text-[#6B7280]">{client.contact_email ?? '—'}</td>
                    <td className="py-4 px-4">
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-[#FFF0E6] hover:scale-110">
                        <ChevronRight className="w-4 h-4 text-[#FF6B00]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[#9CA3AF] text-sm">Nenhum cliente encontrado.</p>
                <p className="text-[#D1D5DB] text-xs mt-1">Tente ajustar os filtros ou a busca.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  );
}
