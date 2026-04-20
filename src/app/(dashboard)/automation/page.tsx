'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, Zap, Link2, CheckCircle2, XCircle } from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useAutomation } from '@/hooks/useAutomation';
import AutomationModal from '@/components/modules/AutomationModal';
import type { AutomationRule, RuleCondition } from '@/lib/types';
import { ACTION_LABELS, ENTITY_LABELS, TEMPLATES, type AutomationTemplate, type EntityLevel, type ActionType } from '@/services/ads/types';

function ConnectCard({ provider, label, connected, accountName, onConnect, onDisconnect }: {
  provider: string; label: string; connected: boolean; accountName?: string;
  onConnect: () => void; onDisconnect: () => void;
}) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center justify-between ${connected ? 'border-green-200 bg-green-50' : 'border-[#E5E7EB] bg-white'}`}>
      <div>
        <p className="text-sm font-semibold text-[#1F2937]">{label}</p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">{connected ? accountName ?? 'Conectado' : 'Não conectado'}</p>
      </div>
      {connected
        ? <button onClick={onDisconnect} className="text-xs text-red-500 hover:underline font-medium">Desconectar</button>
        : <button onClick={onConnect} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e65c00] transition-all">
            <Link2 className="w-3 h-3" /> Conectar
          </button>
      }
    </div>
  );
}

function RuleCard({ rule, onToggle, onDelete, toggling, deleting }: {
  rule: AutomationRule; onToggle: () => void; onDelete: () => void;
  toggling: boolean; deleting: boolean;
}) {
  const cg = rule.condition_group;
  const ac = rule.action_config;
  const condSummary = cg
    ? cg.conditions.map((c: RuleCondition) => `${c.metric} ${c.operator} ${c.value}`).join(` ${cg.logic} `)
    : `${rule.metric} ${rule.operator} ${rule.threshold}`;

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${rule.is_active ? 'border-[#F3F4F6]' : 'border-[#F3F4F6] opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Zap className={`w-4 h-4 shrink-0 ${rule.is_active ? 'text-[#FF6B00]' : 'text-[#9CA3AF]'}`} />
            <p className="text-sm font-semibold text-[#1F2937]">{rule.name}</p>
            {rule.template && rule.template !== 'custom' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded-md font-medium">
                {TEMPLATES[rule.template as AutomationTemplate]?.name}
              </span>
            )}
            {rule.entity_level && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-md">
                {ENTITY_LABELS[rule.entity_level as EntityLevel]}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] font-mono">SE {condSummary}</p>
          {ac && <p className="text-xs text-[#6B7280] mt-0.5">→ {ACTION_LABELS[ac.type as ActionType]}{ac.budget_change_pct ? ` (${ac.budget_change_pct}%)` : ''}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggle} disabled={toggling}
            className={`relative w-10 h-5 rounded-full transition-colors ${rule.is_active ? 'bg-[#FF6B00]' : 'bg-[#E5E7EB]'}`}>
            {toggling
              ? <Loader2 className="w-3 h-3 animate-spin absolute top-1 left-1 text-white" />
              : <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${rule.is_active ? 'left-5' : 'left-0.5'}`} />}
          </button>
          <button onClick={onDelete} disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AutomationPage() {
  const { agency } = useAgencyContext();
  const { rules, logs, tokens, loading, error, createRule, updateRule, removeRule, disconnectToken } = useAutomation(agency.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [tab, setTab] = useState<'rules' | 'logs'>('rules');

  const metaToken = tokens.find((t) => t.provider === 'meta');
  const googleToken = tokens.find((t) => t.provider === 'google_ads');

  const handleToggle = async (rule: AutomationRule) => {
    setToggling(rule.id);
    try { await updateRule(rule.id, { is_active: !rule.is_active }); } finally { setToggling(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta regra?')) return;
    setDeleting(id);
    try { await removeRule(id); } finally { setDeleting(null); }
  };

  const connectMeta = () => {
    window.location.href = `/api/auth/meta?agency_id=${agency.id}`;
  };

  const connectGoogle = () => {
    window.location.href = `/api/auth/google-ads?agency_id=${agency.id}`;
  };

  return (
    <main className="flex-1 p-6 space-y-6 animate-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Automação</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Motor de regras para suas campanhas de Ads</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] transition-all">
          <Plus className="w-4 h-4" /> Nova Regra
        </button>
      </div>

      {/* Integrações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ConnectCard provider="meta" label="Meta Ads" connected={!!metaToken} accountName={metaToken?.account_name}
          onConnect={connectMeta} onDisconnect={() => disconnectToken('meta')} />
        <ConnectCard provider="google_ads" label="Google Ads" connected={!!googleToken} accountName={googleToken?.account_name}
          onConnect={connectGoogle} onDisconnect={() => disconnectToken('google_ads')} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {(['rules', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#9CA3AF]'}`}>
            {t === 'rules' ? `Regras (${rules.length})` : `Logs (${logs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" /></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500"><AlertCircle className="w-8 h-8 mb-2" /><p className="text-sm">{error}</p></div>
      ) : tab === 'rules' ? (
        rules.length === 0
          ? <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
              <Zap className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Nenhuma regra ainda</p>
              <p className="text-xs mt-1">Crie sua primeira regra usando um dos templates</p>
            </div>
          : <div className="space-y-3">
              {rules.map((r) => (
                <RuleCard key={r.id} rule={r}
                  onToggle={() => handleToggle(r)} onDelete={() => handleDelete(r.id)}
                  toggling={toggling === r.id} deleting={deleting === r.id} />
              ))}
            </div>
      ) : (
        logs.length === 0
          ? <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
              <Zap className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Nenhuma execução ainda</p>
            </div>
          : <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F3F4F6]">
                    {['Regra', 'Ação', 'Resultado', 'Mock', 'Data'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3 font-medium text-[#1F2937]">{l.rule_name}</td>
                      <td className="px-4 py-3 text-[#6B7280] font-mono text-xs">{l.action_taken ?? '—'}</td>
                      <td className="px-4 py-3">
                        {l.success
                          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                          : <XCircle className="w-4 h-4 text-red-500" />}
                      </td>
                      <td className="px-4 py-3">
                        {l.mock_mode && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-md font-medium">mock</span>}
                      </td>
                      <td className="px-4 py-3 text-[#9CA3AF] text-xs">
                        {new Date(l.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      <AutomationModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={createRule} agencyId={agency.id} />
    </main>
  );
}
