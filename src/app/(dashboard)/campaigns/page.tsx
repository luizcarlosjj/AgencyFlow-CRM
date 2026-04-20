'use client';

import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle, BarChart2 } from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useClients } from '@/hooks/useClients';
import { useCampaigns } from '@/hooks/useCampaigns';
import CampaignModal from '@/components/modules/CampaignModal';
import type { Campaign } from '@/lib/types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusLabel: Record<string, string> = { active: 'Ativa', paused: 'Pausada', ended: 'Encerrada' };
const statusColor: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  paused: 'bg-yellow-50 text-yellow-700',
  ended: 'bg-gray-100 text-gray-500',
};
const platformLabel: Record<string, string> = { google: 'Google Ads', meta: 'Meta Ads' };
const platformColor: Record<string, string> = {
  google: 'bg-blue-50 text-blue-700',
  meta: 'bg-indigo-50 text-indigo-700',
};

export default function CampaignsPage() {
  const { agency } = useAgencyContext();
  const { clients } = useClients(agency.id);
  const { campaigns, loading, error, createCampaign, updateCampaign, removeCampaign } = useCampaigns(agency.id);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (clientMap[c.client_id] ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Campaign) => { setEditing(c); setModalOpen(true); };

  const handleSave = async (data: Omit<Campaign, 'id' | 'cpa' | 'created_at'>) => {
    if (editing) {
      await updateCampaign(editing.id, data);
    } else {
      await createCampaign(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta campanha?')) return;
    setDeleting(id);
    try { await removeCampaign(id); } finally { setDeleting(null); }
  };

  return (
    <main className="flex-1 p-6 space-y-6 animate-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Campanhas</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''} cadastrada{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          disabled={clients.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Campanha
        </button>
      </div>

      {clients.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800">
          Cadastre pelo menos um cliente antes de criar campanhas.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou cliente..."
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
          <BarChart2 className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">{search ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha ainda'}</p>
          {!search && <p className="text-xs mt-1">Clique em "Nova Campanha" para começar</p>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F3F4F6]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Campanha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Plataforma</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden sm:table-cell">Gasto</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden lg:table-cell">CPA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{c.name}</td>
                  <td className="px-4 py-3 text-[#6B7280] hidden md:table-cell">{clientMap[c.client_id] ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColor[c.platform]}`}>
                      {platformLabel[c.platform]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#1F2937] hidden sm:table-cell">{fmt(c.spend)}</td>
                  <td className="px-4 py-3 text-right text-[#6B7280] hidden lg:table-cell">
                    {c.conversions > 0 ? fmt(c.spend / c.conversions) : '—'}
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

      <CampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        clients={clients}
        initial={editing}
      />
    </main>
  );
}
