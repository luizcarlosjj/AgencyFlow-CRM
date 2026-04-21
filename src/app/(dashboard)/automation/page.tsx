'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Loader2, Zap, Link2, CheckCircle2, XCircle,
  DollarSign, Target, TrendingUp, TrendingDown, ShoppingCart,
  RefreshCw, MousePointerClick, Eye, MousePointer, PauseCircle,
  PlayCircle, Bell, Activity, AlertCircle, type LucideIcon,
} from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useAutomation } from '@/hooks/useAutomation';
import type { AutomationRule, RuleCondition as RuleConditionType } from '@/lib/types';
import {
  METRIC_LABELS, TIME_WINDOW_LABELS, ACTION_LABELS, ENTITY_LABELS, TEMPLATES,
  type MetricKey, type TimeWindow, type ActionType, type EntityLevel,
  type AdsPlatform, type AutomationTemplate, type ConditionOperator,
} from '@/services/ads/types';

// ─── Constantes ───────────────────────────────────────────────────────────────

const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  spend: DollarSign, cpa: Target, roas: TrendingUp,
  conversions: ShoppingCart, frequency: RefreshCw,
  ctr: MousePointerClick, impressions: Eye, clicks: MousePointer,
};

const ACTION_ICONS: Record<ActionType, LucideIcon> = {
  pause: PauseCircle, enable: PlayCircle,
  increase_budget: TrendingUp, decrease_budget: TrendingDown, alert: Bell,
};

const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  pause: 'Para a veiculação', enable: 'Retoma a veiculação',
  increase_budget: 'Sobe o orçamento', decrease_budget: 'Reduz o orçamento',
  alert: 'Registra no log',
};

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: '>', label: 'maior que' }, { value: '<', label: 'menor que' },
  { value: '>=', label: 'maior ou igual' }, { value: '<=', label: 'menor ou igual' },
  { value: '==', label: 'igual a' },
];

const TEMPLATE_PRESETS: Record<AutomationTemplate, {
  platform: AdsPlatform; entityLevel: EntityLevel; logic: 'AND' | 'OR';
  conditions: RuleConditionType[]; actionType: ActionType; budgetPct: string;
}> = {
  stop_loss: {
    platform: 'both', entityLevel: 'adset', logic: 'AND', actionType: 'pause', budgetPct: '0',
    conditions: [
      { metric: 'spend', operator: '>', value: 100, time_window: 'today' },
      { metric: 'conversions', operator: '==', value: 0, time_window: 'today' },
    ],
  },
  scale_up: {
    platform: 'both', entityLevel: 'adset', logic: 'AND', actionType: 'increase_budget', budgetPct: '15',
    conditions: [
      { metric: 'cpa', operator: '<', value: 50, time_window: '3d' },
      { metric: 'conversions', operator: '>', value: 5, time_window: '3d' },
    ],
  },
  fatigue_control: {
    platform: 'meta', entityLevel: 'ad', logic: 'AND', actionType: 'pause', budgetPct: '0',
    conditions: [
      { metric: 'frequency', operator: '>', value: 3.5, time_window: '7d' },
      { metric: 'ctr', operator: '<', value: 1.0, time_window: '7d' },
    ],
  },
  weekend_protection: {
    platform: 'both', entityLevel: 'campaign', logic: 'AND', actionType: 'decrease_budget', budgetPct: '50',
    conditions: [{ metric: 'roas', operator: '<', value: 1.5, time_window: '7d' }],
  },
  custom: {
    platform: 'both', entityLevel: 'campaign', logic: 'AND', actionType: 'alert', budgetPct: '0',
    conditions: [{ metric: 'cpa', operator: '>', value: 100, time_window: 'today' }],
  },
};

const BLANK: RuleConditionType = { metric: 'cpa', operator: '>', value: 0, time_window: 'today' };

// ─── StepCard ─────────────────────────────────────────────────────────────────

function StepCard({ step, title, subtitle, last, children }: {
  step: number; title: string; subtitle: string; last?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-orange-200 z-10">
          {step}
        </div>
        {!last && <div className="w-px flex-1 bg-gradient-to-b from-orange-200 to-transparent mt-1" />}
      </div>
      <div className={`flex-1 ${last ? 'pb-2' : 'pb-5'}`}>
        <div className="mb-3 pt-1">
          <h3 className="text-sm font-semibold text-[#1F2937]">{title}</h3>
          <p className="text-xs text-[#9CA3AF]">{subtitle}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── ConditionRow ─────────────────────────────────────────────────────────────

function ConditionRow({ condition, index, total, logic, onUpdate, onRemove }: {
  condition: RuleConditionType; index: number; total: number; logic: 'AND' | 'OR';
  onUpdate: (f: keyof RuleConditionType, v: string | number) => void;
  onRemove: () => void;
}) {
  const Icon = METRIC_ICONS[condition.metric];
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center flex-wrap">
        {/* Metric */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          <div className="p-1.5 rounded-lg bg-orange-50 shrink-0">
            <Icon className="w-3.5 h-3.5 text-[#FF6B00]" />
          </div>
          <select value={condition.metric}
            onChange={(e) => onUpdate('metric', e.target.value as MetricKey)}
            className="flex-1 px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all">
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => (
              <option key={k} value={k}>{METRIC_LABELS[k]}</option>
            ))}
          </select>
        </div>
        {/* Operator */}
        <select value={condition.operator}
          onChange={(e) => onUpdate('operator', e.target.value as ConditionOperator)}
          className="px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all">
          {OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        {/* Value */}
        <input type="number" step="0.01" value={condition.value}
          onChange={(e) => onUpdate('value', parseFloat(e.target.value) || 0)}
          className="w-20 px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-mono text-center" />
        {/* Time window */}
        <select value={condition.time_window}
          onChange={(e) => onUpdate('time_window', e.target.value as TimeWindow)}
          className="px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all">
          {(Object.keys(TIME_WINDOW_LABELS) as TimeWindow[]).map((k) => (
            <option key={k} value={k}>{TIME_WINDOW_LABELS[k]}</option>
          ))}
        </select>
        {/* Delete */}
        <button type="button" onClick={onRemove}
          className="p-2 rounded-xl hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Logic connector */}
      {index < total - 1 && (
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-[#F3F4F6]" />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider ${
            logic === 'AND' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
          }`}>{logic}</span>
          <div className="flex-1 h-px bg-[#F3F4F6]" />
        </div>
      )}
    </div>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({ type, selected, onClick }: {
  type: ActionType; selected: boolean; onClick: () => void;
}) {
  const Icon = ACTION_ICONS[type];
  const colors: Record<ActionType, string> = {
    pause:           'text-red-500 bg-red-50 border-red-200',
    enable:          'text-green-600 bg-green-50 border-green-200',
    increase_budget: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    decrease_budget: 'text-amber-600 bg-amber-50 border-amber-200',
    alert:           'text-blue-600 bg-blue-50 border-blue-200',
  };
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all text-center ${
        selected
          ? 'border-[#FF6B00] bg-orange-50 shadow-sm'
          : 'border-[#E5E7EB] bg-white hover:border-[#FF6B00]/40 hover:bg-orange-50/20'
      }`}>
      <div className={`p-2.5 rounded-xl border ${colors[type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-[#1F2937] leading-tight">{ACTION_LABELS[type]}</p>
        <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-tight">{ACTION_DESCRIPTIONS[type]}</p>
      </div>
    </button>
  );
}

// ─── SidebarRuleCard ──────────────────────────────────────────────────────────

function SidebarRuleCard({ rule, onToggle, onDelete, toggling, deleting }: {
  rule: AutomationRule; onToggle: () => void; onDelete: () => void;
  toggling: boolean; deleting: boolean;
}) {
  const cg = rule.condition_group;
  const ac = rule.action_config;
  return (
    <div className={`p-3 rounded-xl border transition-all ${rule.is_active ? 'border-[#E5E7EB] bg-white' : 'border-[#F3F4F6] bg-[#FAFAFA] opacity-60'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#1F2937] truncate">{rule.name}</p>
          {ac && (
            <p className="text-[10px] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 shrink-0" />
              {ACTION_LABELS[ac.type as ActionType]}
            </p>
          )}
          {cg && (
            <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5 truncate">
              SE {cg.conditions[0]?.metric} {cg.conditions[0]?.operator} {cg.conditions[0]?.value}
              {cg.conditions.length > 1 && ` +${cg.conditions.length - 1}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onToggle} disabled={toggling}
            className={`relative w-8 h-4 rounded-full transition-colors ${rule.is_active ? 'bg-[#FF6B00]' : 'bg-[#E5E7EB]'}`}>
            {toggling
              ? <Loader2 className="w-2.5 h-2.5 animate-spin absolute top-0.5 left-0.5 text-white" />
              : <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${rule.is_active ? 'left-4' : 'left-0.5'}`} />
            }
          </button>
          <button onClick={onDelete} disabled={deleting}
            className="p-1 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AutomationPage ───────────────────────────────────────────────────────────

export default function AutomationPage() {
  const { agency } = useAgencyContext();
  const { rules, logs, tokens, loading, refetch, createRule, updateRule, removeRule, disconnectToken } = useAutomation(agency.id);

  // Builder
  const [template,     setTemplate]     = useState<AutomationTemplate>('stop_loss');
  const [ruleName,     setRuleName]     = useState(TEMPLATES.stop_loss.name);
  const [platform,     setPlatform]     = useState<AdsPlatform>('both');
  const [entityLevel,  setEntityLevel]  = useState<EntityLevel>('adset');
  const [logic,        setLogic]        = useState<'AND' | 'OR'>('AND');
  const [conditions,   setConditions]   = useState<RuleConditionType[]>(TEMPLATE_PRESETS.stop_loss.conditions);
  const [actionType,   setActionType]   = useState<ActionType>('pause');
  const [budgetPct,    setBudgetPct]    = useState('0');
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState('');
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  // OAuth
  const [connectingProvider,   setConnectingProvider]   = useState<string | null>(null);
  const [googleMccConfigured,  setGoogleMccConfigured]  = useState(false);
  const popupRef = useRef<Window | null>(null);

  // Sidebar actions
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const metaToken   = tokens.find((t) => t.provider === 'meta');
  const googleToken = tokens.find((t) => t.provider === 'google_ads');

  useEffect(() => {
    fetch(`/api/agency/credentials?agency_id=${agency.id}`)
      .then((r) => r.json())
      .then((d) => setGoogleMccConfigured(!!d.google_mcc_id))
      .catch(() => {});
  }, [agency.id]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'oauth_complete') return;
      setConnectingProvider(null);
      popupRef.current = null;
      if (!event.data.error) refetch();
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch]);

  function openOAuthPopup(url: string, provider: string) {
    const w = 600, h = 700;
    const left = Math.round(window.screenX + (window.outerWidth  - w) / 2);
    const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);
    const popup = window.open(url, `oauth_${provider}`, `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`);
    if (popup) { popupRef.current = popup; setConnectingProvider(provider); }
  }

  const applyTemplate = (tpl: AutomationTemplate) => {
    const p = TEMPLATE_PRESETS[tpl];
    setTemplate(tpl); setRuleName(TEMPLATES[tpl].name);
    setPlatform(p.platform); setEntityLevel(p.entityLevel);
    setLogic(p.logic); setConditions([...p.conditions]);
    setActionType(p.actionType); setBudgetPct(p.budgetPct);
  };

  const updateCondition = (i: number, field: keyof RuleConditionType, value: string | number) =>
    setConditions((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) { setSaveError('Nome da regra é obrigatório.'); return; }
    if (conditions.length === 0) { setSaveError('Adicione ao menos uma condição.'); return; }
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    try {
      await createRule({
        agency_id: agency.id, name: ruleName.trim(), template, platform,
        entity_level: entityLevel, condition_group: { logic, conditions },
        action_config: {
          type: actionType,
          budget_change_pct: (actionType === 'increase_budget' || actionType === 'decrease_budget')
            ? parseFloat(budgetPct) || 15 : undefined,
        },
        is_active: true,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar regra.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (rule: AutomationRule) => {
    setToggling(rule.id);
    try { await updateRule(rule.id, { is_active: !rule.is_active }); } finally { setToggling(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta regra?')) return;
    setDeleting(id);
    try { await removeRule(id); } finally { setDeleting(null); }
  };

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 shrink-0 border-b border-[#F3F4F6]">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Automação</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Construa regras inteligentes para suas campanhas de Ads</p>
        </div>
        {/* Integration pills */}
        <div className="flex items-center gap-2 shrink-0">
          {metaToken
            ? <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-700">Meta</span>
                <button onClick={() => disconnectToken('meta')} className="text-[10px] text-green-600 hover:text-red-500 ml-1 transition-colors">×</button>
              </div>
            : <button onClick={() => openOAuthPopup(`/api/auth/meta?agency_id=${agency.id}`, 'meta')} disabled={connectingProvider === 'meta'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-xs font-medium text-[#6B7280] hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all disabled:opacity-50">
                {connectingProvider === 'meta' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                {connectingProvider === 'meta' ? 'Conectando…' : 'Conectar Meta'}
              </button>
          }
          {googleToken
            ? <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-700">Google</span>
                <button onClick={() => disconnectToken('google_ads')} className="text-[10px] text-green-600 hover:text-red-500 ml-1 transition-colors">×</button>
              </div>
            : <button onClick={() => openOAuthPopup(`/api/auth/google-ads?agency_id=${agency.id}`, 'google')}
                disabled={connectingProvider === 'google' || !googleMccConfigured}
                title={!googleMccConfigured ? 'Configure o MCC ID em Configurações antes de conectar' : undefined}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-xs font-medium text-[#6B7280] hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {connectingProvider === 'google' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                {connectingProvider === 'google' ? 'Conectando…' : 'Conectar Google'}
              </button>
          }
        </div>
      </div>

      {/* ── Body 70/30 ── */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">

        {/* LEFT: Rule Builder */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-0 pb-4">

            {/* Template chips */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Início rápido</p>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(TEMPLATES) as AutomationTemplate[]).map((tpl) => (
                  <button key={tpl} type="button" onClick={() => applyTemplate(tpl)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      template === tpl
                        ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-sm'
                        : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6B00]/50 hover:text-[#FF6B00]'
                    }`}>
                    {TEMPLATES[tpl].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Escopo */}
            <StepCard step={1} title="Escopo" subtitle="Nomeie a regra e defina onde ela será aplicada">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Nome da Regra *</label>
                  <input value={ruleName} onChange={(e) => setRuleName(e.target.value)} required
                    placeholder="Ex: Stop-Loss Diário — Google Ads"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2 block">Plataforma</label>
                  <div className="flex gap-2">
                    {([['meta', 'Meta Ads'], ['google', 'Google Ads'], ['both', 'Ambas']] as [AdsPlatform, string][]).map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setPlatform(val)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          platform === val
                            ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-sm'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6B00]/40'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2 block">Nível da Entidade</label>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.entries(ENTITY_LABELS) as [EntityLevel, string][]).map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setEntityLevel(val)}
                        className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                          entityLevel === val
                            ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-sm'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6B00]/40'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>

            {/* Step 2: Condições */}
            <StepCard step={2} title="Condições — SE" subtitle="A regra executa quando as condições abaixo forem atendidas">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9CA3AF]">Combinar condições com:</p>
                  <div className="flex p-0.5 gap-0.5 bg-[#F3F4F6] rounded-lg">
                    {(['AND', 'OR'] as const).map((l) => (
                      <button key={l} type="button" onClick={() => setLogic(l)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          logic === l ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#9CA3AF] hover:text-[#6B7280]'
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {conditions.map((c, i) => (
                    <ConditionRow key={i} condition={c} index={i} total={conditions.length} logic={logic}
                      onUpdate={(f, v) => updateCondition(i, f, v)}
                      onRemove={() => setConditions((p) => p.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
                {conditions.length === 0 && (
                  <div className="py-4 text-center text-xs text-[#9CA3AF] border border-dashed border-[#E5E7EB] rounded-xl">
                    Nenhuma condição. Clique abaixo para adicionar.
                  </div>
                )}
                <button type="button"
                  onClick={() => setConditions((p) => [...p, { ...BLANK }])}
                  className="flex items-center gap-1.5 text-xs text-[#FF6B00] font-semibold hover:underline mt-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar condição
                </button>
              </div>
            </StepCard>

            {/* Step 3: Ação */}
            <StepCard step={3} title="Ação — ENTÃO" subtitle="O que o sistema fará quando as condições forem verdadeiras" last>
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(Object.keys(ACTION_LABELS) as ActionType[]).map((type) => (
                    <ActionCard key={type} type={type} selected={actionType === type}
                      onClick={() => setActionType(type)} />
                  ))}
                </div>
                {(actionType === 'increase_budget' || actionType === 'decrease_budget') && (
                  <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] animate-pulse-once">
                    <span className="text-sm text-[#6B7280]">
                      {actionType === 'increase_budget' ? 'Aumentar em' : 'Reduzir em'}
                    </span>
                    <input type="number" min="1" max="100" value={budgetPct}
                      onChange={(e) => setBudgetPct(e.target.value)}
                      className="w-20 px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] text-center font-mono" />
                    <span className="text-sm text-[#6B7280]">% do orçamento atual</span>
                  </div>
                )}
              </div>
            </StepCard>

            {/* Feedback + Save */}
            <div className="pt-4 space-y-3">
              {saveError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Regra criada! Aparece na lista ao lado.
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full py-4 bg-[#FF6B00] text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-200 hover:bg-[#e65c00] active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando regra…</>
                  : <><Zap className="w-4 h-4" /> Salvar Regra de Automação</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">

          {/* Active Rules */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#1F2937] uppercase tracking-wider">Regras Ativas</h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">
                {rules.filter((r) => r.is_active).length}/{rules.length}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
              {loading
                ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" /></div>
                : rules.length === 0
                  ? <div className="flex flex-col items-center py-8 text-[#9CA3AF]">
                      <Zap className="w-8 h-8 mb-2" />
                      <p className="text-xs font-medium">Nenhuma regra ainda</p>
                      <p className="text-[11px] mt-0.5">Salve uma regra ao lado</p>
                    </div>
                  : rules.map((r) => (
                      <SidebarRuleCard key={r.id} rule={r}
                        onToggle={() => handleToggle(r)} onDelete={() => handleDelete(r.id)}
                        toggling={toggling === r.id} deleting={deleting === r.id} />
                    ))
              }
            </div>
          </div>

          {/* Execution Log */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#FF6B00]" />
              <h3 className="text-[11px] font-bold text-[#1F2937] uppercase tracking-wider">Últimas Execuções</h3>
            </div>
            <div className="overflow-y-auto max-h-96">
              {logs.length === 0
                ? <div className="flex flex-col items-center py-8 text-[#9CA3AF]">
                    <Activity className="w-8 h-8 mb-2" />
                    <p className="text-xs font-medium">Sem execuções ainda</p>
                    <p className="text-[11px] mt-0.5">O cron roda a cada hora</p>
                  </div>
                : <div className="divide-y divide-[#F9FAFB]">
                    {logs.slice(0, 20).map((log) => (
                      <div key={log.id} className="px-4 py-3 hover:bg-[#FAFAFA] transition-colors">
                        <div className="flex items-start gap-2">
                          {log.success
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#1F2937] truncate">{log.rule_name}</p>
                            <p className="text-[10px] text-[#9CA3AF] font-mono truncate mt-0.5">{log.action_taken ?? '—'}</p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                              {new Date(log.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
