'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Client, ClientStatus } from '@/lib/types';

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
  agencyId: string;
  initial?: Client | null;
}

const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'churned', label: 'Cancelado' },
];

export default function ClientModal({ open, onClose, onSave, agencyId, initial }: ClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fee, setFee] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [nextPayment, setNextPayment] = useState('');
  const [googleCid, setGoogleCid] = useState('');
  const [metaAdAccount, setMetaAdAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setEmail(initial.contact_email ?? '');
      setFee(String(initial.monthly_fee));
      setStatus(initial.status);
      setNextPayment(initial.next_payment_date ?? '');
      setGoogleCid(initial.google_customer_id ?? '');
      setMetaAdAccount(initial.meta_ad_account_id ?? '');
    } else {
      setName(''); setEmail(''); setFee(''); setStatus('active'); setNextPayment('');
      setGoogleCid(''); setMetaAdAccount('');
    }
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório.'); return; }
    const feeNum = parseFloat(fee);
    if (isNaN(feeNum) || feeNum < 0) { setError('Mensalidade inválida.'); return; }

    setLoading(true);
    setError('');
    try {
      await onSave({
        agency_id: agencyId,
        name: name.trim(),
        contact_email: email.trim() || undefined,
        monthly_fee: feeNum,
        status,
        next_payment_date: nextPayment || undefined,
        google_customer_id: googleCid.trim() || undefined,
        meta_ad_account_id: metaAdAccount.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-page">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#F3F4F6]">
        <div className="flex items-center justify-between p-6 border-b border-[#F3F4F6]">
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">
            {initial ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome da empresa ou cliente"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">E-mail de Contato</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@empresa.com"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Mensalidade (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
                placeholder="0,00"
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Próximo Pagamento</label>
            <input
              type="date"
              value={nextPayment}
              onChange={(e) => setNextPayment(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
            />
          </div>

          <div className="border-t border-[#F3F4F6] pt-4">
            <p className="text-xs font-semibold text-[#9CA3AF] mb-3 uppercase tracking-wide">Contas de Anúncios</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6B7280] mb-1.5 block">Google Ads — Customer ID</label>
                <input
                  value={googleCid}
                  onChange={(e) => setGoogleCid(e.target.value)}
                  placeholder="ex: 1234567890"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-[#6B7280] mb-1.5 block">Meta Ads — Ad Account ID</label>
                <input
                  value={metaAdAccount}
                  onChange={(e) => setMetaAdAccount(e.target.value)}
                  placeholder="ex: act_1234567890"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Salvar Alterações' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
