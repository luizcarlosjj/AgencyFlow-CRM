'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { createClient } from '@/lib/supabase/client';

// ─── Campo de secret com toggle de visibilidade ───────────────────────────────
function SecretInput({ label, name, value, onChange, placeholder, hint }: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-2.5 pr-10 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all font-mono"
        />
        <button type="button" onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-[#9CA3AF] mt-1">{hint}</p>}
    </div>
  );
}

// ─── Indicador de campo já configurado ───────────────────────────────────────
function SavedBadge({ saved }: { saved: boolean }) {
  if (!saved) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md ml-2">
      <ShieldCheck className="w-3 h-3" /> Salvo
    </span>
  );
}

// ─── Seção de credenciais de API ──────────────────────────────────────────────
function CredentialsForm({ agencyId }: { agencyId: string }) {
  const [metaAppId,   setMetaAppId]   = useState('');
  const [metaSecret,  setMetaSecret]  = useState('');
  const [googleMccId, setGoogleMccId] = useState('');
  const [hasMetaSecret, setHasMetaSecret] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`/api/agency/credentials?agency_id=${agencyId}`)
      .then((r) => r.json())
      .then((d) => {
        setMetaAppId(d.meta_app_id ?? '');
        setGoogleMccId(d.google_mcc_id ?? '');
        setHasMetaSecret(d.has_meta_secret ?? false);
      })
      .finally(() => setLoading(false));
  }, [agencyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const body: Record<string, string> = { agency_id: agencyId };
      body.meta_app_id    = metaAppId.trim();
      body.google_mcc_id  = googleMccId.trim();
      if (metaSecret.trim()) body.meta_app_secret = metaSecret.trim();

      const res = await fetch('/api/agency/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar');

      setMetaSecret('');
      if (metaSecret.trim()) setHasMetaSecret(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" />
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Chaves secretas são <strong>criptografadas com AES-256-GCM</strong> antes de salvar.
          Apenas o servidor tem acesso — nunca expostas ao navegador.
        </span>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

      {/* Meta Ads */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider flex items-center gap-2">
          Meta Ads
          {hasMetaSecret && <SavedBadge saved />}
        </h3>
        <div>
          <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">App ID</label>
          <input value={metaAppId} onChange={(e) => setMetaAppId(e.target.value)}
            placeholder="Ex: 1234567890123456"
            className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all font-mono" />
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            developers.facebook.com/apps → Seu App → Configurações Básicas
          </p>
        </div>
        <SecretInput label="App Secret" name="meta_secret" value={metaSecret} onChange={setMetaSecret}
          placeholder={hasMetaSecret ? '●●●●●●●● (já configurado — deixe em branco para manter)' : 'Cole o App Secret aqui'}
          hint="Será criptografado ao salvar." />
      </div>

      <hr className="border-[#F3F4F6]" />

      {/* Google Ads */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider flex items-center gap-2">
          Google Ads
          {googleMccId && <SavedBadge saved />}
        </h3>
        <div>
          <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">
            MCC ID — Manager Customer ID
          </label>
          <input value={googleMccId} onChange={(e) => setGoogleMccId(e.target.value)}
            placeholder="Ex: 123-456-7890"
            className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all font-mono" />
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            Número de 10 dígitos da sua conta de administrador Google Ads (ex: 123-456-7890).
            Obrigatório antes de conectar.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Salvo!' : 'Salvar Credenciais'}
        </button>
        <p className="text-[11px] text-[#9CA3AF]">App Secret em branco mantém o valor anterior.</p>
      </div>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { agency, user } = useAgencyContext();

  const [agencyName, setAgencyName] = useState(agency.name);
  const [monthlyGoal, setMonthlyGoal] = useState(String(agency.settings.monthly_goal));
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving,  setPwdSaving]  = useState(false);
  const [pwdSaved,   setPwdSaved]   = useState(false);
  const [pwdError,   setPwdError]   = useState('');

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
      setNewPwd(''); setConfirmPwd('');
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
        <p className="text-sm text-[#9CA3AF] mt-0.5">Gerencie sua agência, credenciais e conta</p>
      </div>

      {/* Dados da Agência */}
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
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      {/* Credenciais de API */}
      <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm p-6">
        <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-1">Credenciais de API</h2>
        <p className="text-xs text-[#9CA3AF] mb-5">
          Configure as credenciais dos seus apps Meta e Google para ativar a automação de campanhas.
        </p>
        <CredentialsForm agencyId={agency.id} />
      </div>

      {/* Conta / Senha */}
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
