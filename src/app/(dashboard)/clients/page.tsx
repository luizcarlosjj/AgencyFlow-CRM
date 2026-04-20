'use client';

import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle, Users } from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useClients } from '@/hooks/useClients';
import ClientModal from '@/components/modules/ClientModal';
import type { Client } from '@/lib/types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusLabel: Record<string, string> = { active: 'Ativo', paused: 'Pausado', churned: 'Cancelado' };
const statusColor: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  paused: 'bg-yellow-50 text-yellow-700',
  churned: 'bg-red-50 text-red-700',
};

export default function ClientsPage() {
  const { agency } = useAgencyContext();
  const { clients, loading, error, createClient, updateClient, removeClient } = useClients(agency.id);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_email ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setModalOpen(true); };

  const handleSave = async (data: Omit<Client, 'id' | 'created_at'>) => {
    if (editing) {
      await updateClient(editing.id, data);
    } else {
      await createClient(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    setDeleting(id);
    try { await removeClient(id); } finally { setDeleting(null); }
  };

  return (
    <main className="flex-1 p-6 space-y-6 animate-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Clientes</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
          <Users className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}</p>
          {!search && <p className="text-xs mt-1">Clique em "Novo Cliente" para começar</p>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F3F4F6]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Mensalidade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden sm:table-cell">Próx. Pgto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{c.name}</td>
                  <td className="px-4 py-3 text-[#6B7280] hidden md:table-cell">{c.contact_email ?? '—'}</td>
                  <td className="px-4 py-3 text-[#1F2937]">{fmt(c.monthly_fee)}</td>
                  <td className="px-4 py-3 text-[#6B7280] hidden sm:table-cell">
                    {c.next_payment_date
                      ? new Date(c.next_payment_date + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}>
                      {statusLabel[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
                      >
                        {deleting === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        agencyId={agency.id}
        initial={editing}
      />
    </main>
  );
}
