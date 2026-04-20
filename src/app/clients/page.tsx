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
  { value: 'active', label: 'Activos' },
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
      <Header title="Clientes" subtitle={`${mockClients.filter((c) => c.status === 'active').length} activos · MRR ${formatCurrency(totalMRR)}`} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total de Clientes', value: mockClients.length, color: 'text-[#1F2937]' },
            { label: 'MRR Total', value: formatCurrency(totalMRR), color: 'text-[#FF6B00]' },
            { label: 'Churn Rate', value: `${((mockClients.filter(c => c.status === 'churned').length / mockClients.length) * 100).toFixed(0)}%`, color: 'text-red-600' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <p className="text-sm text-[#6B7280]">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === f.value
                      ? 'bg-[#FF6B00] text-white'
                      : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#FFF0E6] hover:text-[#FF6B00]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 w-44"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors">
                <UserPlus className="w-4 h-4" />
                Novo Cliente
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Cliente', 'Status', 'Mensalidade', 'Próx. Pagamento', 'Contacto', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center text-[#FF6B00] font-bold text-sm">
                          {client.name.charAt(0)}
                        </div>
                        <span className="font-medium text-[#1F2937]">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={client.status} /></td>
                    <td className="py-3.5 px-4 font-semibold text-[#1F2937]">{formatCurrency(client.monthly_fee)}</td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{formatDate(client.next_payment_date)}</td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{client.contact_email ?? '—'}</td>
                    <td className="py-3.5 px-4">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#FFF0E6]">
                        <ChevronRight className="w-4 h-4 text-[#FF6B00]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-[#6B7280] text-sm">Nenhum cliente encontrado.</div>
            )}
          </div>
        </div>

      </main>
    </>
  );
}
