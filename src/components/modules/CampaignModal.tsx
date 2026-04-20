'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Campaign, CampaignStatus, Platform, Client } from '@/lib/types';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Campaign, 'id' | 'cpa' | 'created_at'>) => Promise<void>;
  clients: Client[];
  initial?: Campaign | null;
}

export default function CampaignModal({ open, onClose, onSave, clients, initial }: CampaignModalProps) {
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform>('google');
  const [spend, setSpend] = useState('');
  const [conversions, setConversions] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('active');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setClientId(initial.client_id);
      setName(initial.name);
      setPlatform(initial.platform);
      setSpend(String(initial.spend));
      setConversions(String(initial.conversions));
      setStatus(initial.status);
      setPeriodStart(initial.period_start ?? '');
      setPeriodEnd(initial.period_end ?? '');
    } else {
      setClientId(clients[0]?.id ?? '');
      setName(''); setPlatform('google'); setSpend(''); setConversions('0');
      setStatus('active'); setPeriodStart(''); setPeriodEnd('');
    }
    setError('');
  }, [initial, open, clients]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError('Selecione um cliente.'); return; }
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }

    setLoading(true);
    setError('');
    try {
      await onSave({
        client_id: clientId,
        name: name.trim(),
        platform,
        spend: parseFloat(spend) || 0,
        conversions: parseInt(conversions) || 0,
        status,
        period_start: periodStart || undefined,
        period_end: periodEnd || undefined,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar campanha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-page">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#F3F4F6]">
        <div className="flex items-center justify-between p-6 border-b border-[#F3F4F6]">
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">
            {initial ? 'Editar Campanha' : 'Nova Campanha'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Cliente *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all"
              >
                <option value="">Selecione o cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nome da Campanha *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Brand Awareness — Google"
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Plataforma</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all"
              >
                <option value="google">Google Ads</option>
                <option value="meta">Meta Ads</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all"
              >
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="ended">Encerrada</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Gasto (R$)</label>
              <input type="number" min="0" step="0.01" value={spend} onChange={(e) => setSpend(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Conversões</label>
              <input type="number" min="0" value={conversions} onChange={(e) => setConversions(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Início do Período</label>
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Fim do Período</label>
              <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Salvar Alterações' : 'Criar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
