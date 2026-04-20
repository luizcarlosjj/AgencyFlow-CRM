'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import type { AutomationRule, ConditionGroup, RuleCondition, RuleActionConfig } from '@/lib/types';
import {
  METRIC_LABELS, TIME_WINDOW_LABELS, ACTION_LABELS, ENTITY_LABELS, TEMPLATES,
  type MetricKey, type TimeWindow, type ActionType, type EntityLevel, type AdsPlatform, type AutomationTemplate,
} from '@/services/ads/types';

// ─── Templates pré-configurados ──────────────────────────────────────────────

const TEMPLATE_PRESETS: Record<AutomationTemplate, Partial<{
  platform: AdsPlatform; entity_level: EntityLevel;
  condition_group: ConditionGroup; action_config: RuleActionConfig;
}>> = {
  stop_loss: {
    platform: 'both', entity_level: 'adset',
    condition_group: { logic: 'AND', conditions: [
      { metric: 'spend', operator: '>', value: 100, time_window: 'today' },
      { metric: 'conversions', operator: '==', value: 0, time_window: 'today' },
    ]},
    action_config: { type: 'pause' },
  },
  scale_up: {
    platform: 'both', entity_level: 'adset',
    condition_group: { logic: 'AND', conditions: [
      { metric: 'cpa', operator: '<', value: 50, time_window: '3d' },
      { metric: 'conversions', operator: '>', value: 5, time_window: '3d' },
    ]},
    action_config: { type: 'increase_budget', budget_change_pct: 15 },
  },
  fatigue_control: {
    platform: 'meta', entity_level: 'ad',
    condition_group: { logic: 'AND', conditions: [
      { metric: 'frequency', operator: '>', value: 3.5, time_window: '7d' },
      { metric: 'ctr', operator: '<', value: 1.0, time_window: '7d' },
    ]},
    action_config: { type: 'pause' },
  },
  weekend_protection: {
    platform: 'both', entity_level: 'campaign',
    condition_group: { logic: 'AND', conditions: [
      { metric: 'roas', operator: '<', value: 1.5, time_window: '7d' },
    ]},
    action_config: { type: 'decrease_budget', budget_change_pct: 50 },
  },
  custom: { platform: 'both', entity_level: 'campaign',
    condition_group: { logic: 'AND', conditions: [{ metric: 'cpa', operator: '>', value: 100, time_window: 'today' }] },
    action_config: { type: 'alert' },
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<AutomationRule, 'id' | 'created_at'>) => Promise<AutomationRule>;
  agencyId: string;
}

const blank: RuleCondition = { metric: 'cpa', operator: '>', value: 0, time_window: 'today' };

export default function AutomationModal({ open, onClose, onSave, agencyId }: Props) {
  const [template, setTemplate] = useState<AutomationTemplate>('stop_loss');
  const [name, setName] = useState('Stop-Loss Diário');
  const [platform, setPlatform] = useState<AdsPlatform>('both');
  const [entityLevel, setEntityLevel] = useState<EntityLevel>('adset');
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<RuleCondition[]>(TEMPLATE_PRESETS.stop_loss.condition_group!.conditions);
  const [actionType, setActionType] = useState<ActionType>('pause');
  const [budgetPct, setBudgetPct] = useState('15');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const applyTemplate = (tpl: AutomationTemplate) => {
    setTemplate(tpl);
    setName(TEMPLATES[tpl].name);
    const p = TEMPLATE_PRESETS[tpl];
    if (p.platform) setPlatform(p.platform);
    if (p.entity_level) setEntityLevel(p.entity_level);
    if (p.condition_group) { setLogic(p.condition_group.logic); setConditions(p.condition_group.conditions); }
    if (p.action_config) { setActionType(p.action_config.type); setBudgetPct(String(p.action_config.budget_change_pct ?? 15)); }
  };

  const updateCondition = (i: number, field: keyof RuleCondition, value: string | number) => {
    setConditions((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nome obrigatório.'); return; }
    if (conditions.length === 0) { setError('Adicione ao menos uma condição.'); return; }
    setLoading(true); setError('');
    try {
      await onSave({
        agency_id: agencyId, name: name.trim(), template,
        platform, entity_level: entityLevel,
        condition_group: { logic, conditions },
        action_config: { type: actionType, budget_change_pct: parseFloat(budgetPct) || 15 },
        is_active: true,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-page">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#F3F4F6]">
        <div className="flex items-center justify-between p-6 border-b border-[#F3F4F6] sticky top-0 bg-white z-10">
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">Nova Regra de Automação</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"><X className="w-4 h-4 text-[#9CA3AF]" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

          {/* Templates */}
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-2 block uppercase tracking-wide">Template</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(TEMPLATES) as AutomationTemplate[]).map((tpl) => (
                <button key={tpl} type="button" onClick={() => applyTemplate(tpl)}
                  className={`p-3 rounded-xl border text-left transition-all ${template === tpl ? 'border-[#FF6B00] bg-orange-50' : 'border-[#E5E7EB] hover:border-[#FF6B00]/50'}`}>
                  <p className="text-xs font-semibold text-[#1F2937]">{TEMPLATES[tpl].name}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-tight">{TEMPLATES[tpl].description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nome *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all" />
          </div>

          {/* Plataforma + Nível */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Plataforma</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as AdsPlatform)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all">
                <option value="meta">Meta Ads</option>
                <option value="google">Google Ads</option>
                <option value="both">Ambas</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nível</label>
              <select value={entityLevel} onChange={(e) => setEntityLevel(e.target.value as EntityLevel)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all">
                {(Object.keys(ENTITY_LABELS) as EntityLevel[]).map((k) => (
                  <option key={k} value={k}>{ENTITY_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condições */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Condições</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">Lógica:</span>
                {(['AND', 'OR'] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setLogic(l)}
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${logic === l ? 'bg-[#FF6B00] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <select value={c.metric} onChange={(e) => updateCondition(i, 'metric', e.target.value as MetricKey)}
                    className="col-span-3 px-2 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 bg-white">
                    {(Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => <option key={k} value={k}>{METRIC_LABELS[k]}</option>)}
                  </select>
                  <select value={c.operator} onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                    className="col-span-2 px-2 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 bg-white">
                    {(['>', '<', '>=', '<=', '=='] as const).map((op) => <option key={op} value={op}>{op}</option>)}
                  </select>
                  <input type="number" step="0.01" value={c.value} onChange={(e) => updateCondition(i, 'value', parseFloat(e.target.value))}
                    className="col-span-2 px-2 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25" />
                  <select value={c.time_window} onChange={(e) => updateCondition(i, 'time_window', e.target.value as TimeWindow)}
                    className="col-span-4 px-2 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 bg-white">
                    {(Object.keys(TIME_WINDOW_LABELS) as TimeWindow[]).map((k) => <option key={k} value={k}>{TIME_WINDOW_LABELS[k]}</option>)}
                  </select>
                  <button type="button" onClick={() => setConditions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="col-span-1 p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setConditions((prev) => [...prev, { ...blank }])}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#FF6B00] font-semibold hover:underline">
              <Plus className="w-3.5 h-3.5" /> Adicionar condição
            </button>
          </div>

          {/* Ação */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Ação</label>
              <select value={actionType} onChange={(e) => setActionType(e.target.value as ActionType)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all">
                {(Object.keys(ACTION_LABELS) as ActionType[]).map((k) => <option key={k} value={k}>{ACTION_LABELS[k]}</option>)}
              </select>
            </div>
            {(actionType === 'increase_budget' || actionType === 'decrease_budget') && (
              <div>
                <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Variação (%)</label>
                <input type="number" min="1" max="100" value={budgetPct} onChange={(e) => setBudgetPct(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 transition-all" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-all">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Regra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
