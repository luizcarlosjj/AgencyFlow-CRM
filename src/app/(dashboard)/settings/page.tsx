'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { agency, user } = useAgencyContext();

  const [agencyName, setAgencyName] = useState(agency.name);
  const [monthlyGoal, setMonthlyGoal] = useState(String(agency.settings.monthly_goal));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) { setError('Nome é obrigatório.'); return; }
    const goal = parseFloat(monthlyGoal);
    if (isNaN(goal) || goal < 0) { setError('Meta inválida.'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('agencies')
        .update({ name: agencyName.trim(), settings: { ...agency.settings, monthly_goal: goal } })
        .eq('id', agency.id);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) { setPwdError('A nova senha deve ter no mínimo 6 caracteres.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('As senhas não coincidem.'); return; }
    setPwdSaving(true); setPwdError(''); setPwdSaved(false);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password: newPwd });
      if (err) throw err;
      setPwdSaved(true);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwdSaved(false), 2000);
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : 'Erro ao alterar senha.');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <main className="flex-1 p-6 space-y-6 animate-page max-w-2xl">
      <div>
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">Configurações</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Gerencie sua agência e conta</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm p-6">
        <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Dados da Agência</h2>
        <form onSubmit={handleSaveAgency} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nome da Agência *</label>
            <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Meta Mensal de Receita (R$)</label>
            <input type="number" min="0" step="0.01" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm p-6">
        <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-1">Conta</h2>
        <p className="text-sm text-[#6B7280] mb-4">{user.email}</p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdError && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{pwdError}</div>}
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nova Senha</label>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Confirmar Nova Senha</label>
            <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required placeholder="Repita a nova senha"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
          </div>
          <button type="submit" disabled={pwdSaving}
            className="px-5 py-2.5 bg-[#1F2937] text-white rounded-xl text-sm font-semibold hover:bg-[#111827] disabled:opacity-60 transition-all flex items-center gap-2">
            {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : pwdSaved ? <Check className="w-4 h-4" /> : null}
            {pwdSaved ? 'Senha alterada!' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </main>
  );
}
