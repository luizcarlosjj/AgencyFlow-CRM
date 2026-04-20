'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle, DollarSign, X } from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useClients } from '@/hooks/useClients';
import { useRevenue } from '@/hooks/useRevenue';
import type { RevenueLog, PaymentStatus } from '@/lib/types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusLabel: Record<PaymentStatus, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Atrasado' };
const statusColor: Record<PaymentStatus, string> = {
  paid: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  overdue: 'bg-red-50 text-red-700',
};

interface LogFormData {
  client_id: string;
  value: string;
  date: string;
  status: PaymentStatus;
}

function LogModal({
  open, onClose, onSave, clients, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<RevenueLog, 'id' | 'created_at'>) => Promise<void>;
  clients: { id: string; name: string }[];
  initial?: RevenueLog | null;
}) {
  const [form, setForm] = useState<LogFormData>({
    client_id: clients[0]?.id ?? '',
    value: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useState(() => {
    if (initial) {
      setForm({ client_id: initial.client_id, value: String(initial.value), date: initial.date, status: initial.status });
    } else {
      setForm({ client_id: clients[0]?.id ?? '', value: '', date: new Date().toISOString().slice(0, 10), status: 'pending' });
    }
    setError('');
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(form.value);
    if (!form.client_id) { setError('Selecione um cliente.'); return; }
    if (isNaN(val) || val <= 0) { setError('Valor inválido.'); return; }
    setLoading(true); setError('');
    try {
      await onSave({ client_id: form.client_id, value: val, date: form.date, status: form.status });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-page">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#F3F4F6]">
        <div className="flex items-center justify-between p-6 border-b border-[#F3F4F6]">
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">{initial ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Cliente *</label>
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all">
              <option value="">Selecione o cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Valor (R$) *</label>
              <input type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required placeholder="0,00"
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all">
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Data *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-all">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Salvar Alterações' : 'Criar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const { agency } = useAgencyContext();
  const { clients } = useClients(agency.id);
  const { logs, loading, error, createLog, updateLog, removeLog } = useRevenue(agency.id);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RevenueLog | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  const filtered = logs.filter((l) =>
    (clientMap[l.client_id] ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const totals = useMemo(() => ({
    paid: logs.filter((l) => l.status === 'paid').reduce((s, l) => s + l.value, 0),
    pending: logs.filter((l) => l.status === 'pending').reduce((s, l) => s + l.value, 0),
    overdue: logs.filter((l) => l.status === 'overdue').reduce((s, l) => s + l.value, 0),
  }), [logs]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (l: RevenueLog) => { setEditing(l); setModalOpen(true); };

  const handleSave = async (data: Omit<RevenueLog, 'id' | 'created_at'>) => {
    if (editing) await updateLog(editing.id, data);
    else await createLog(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este lançamento?')) return;
    setDeleting(id);
    try { await removeLog(id); } finally { setDeleting(null); }
  };

  return (
    <main className="flex-1 p-6 space-y-6 animate-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Receita</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Controle de pagamentos e lançamentos</p>
        </div>
        <button onClick={openCreate} disabled={clients.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Recebido', value: totals.paid, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pendente', value: totals.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Atrasado', value: totals.overdue, color: 'text-red-700', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{s.label}</p>
            <p className={`text-lg font-heading font-bold mt-1 ${s.color}`}>{fmt(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" /></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500"><AlertCircle className="w-8 h-8 mb-2" /><p className="text-sm">{error}</p></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
          <DollarSign className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">{search ? 'Nenhum lançamento encontrado' : 'Nenhum lançamento ainda'}</p>
          {!search && <p className="text-xs mt-1">Clique em "Novo Lançamento" para começar</p>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F3F4F6]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Cliente</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden sm:table-cell">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{clientMap[l.client_id] ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1F2937]">{fmt(l.value)}</td>
                  <td className="px-4 py-3 text-[#6B7280] hidden sm:table-cell">
                    {new Date(l.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[l.status]}`}>
                      {statusLabel[l.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#1F2937] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
                        {deleting === l.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LogModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} clients={clients} initial={editing} />
    </main>
  );
}
