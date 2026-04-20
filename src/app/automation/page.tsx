'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { mockAutomationRules, mockCampaigns, mockClients } from '@/lib/mockData';
import type { AutomationRule, RuleMetric, RuleOperator, RuleAction } from '@/lib/types';
import { Zap, Plus, Trash2, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';

const metricLabels: Record<RuleMetric, string> = { cpa: 'CPA (R$)', spend: 'Gasto (R$)', conversions: 'Conversões' };
const operatorLabels: Record<RuleOperator, string> = { '>': 'maior que', '<': 'menor que', '==': 'igual a' };
const actionLabels: Record<RuleAction, string> = { alert: 'Enviar Alerta', pause: 'Pausar Campanha' };

function evaluateRules(rules: AutomationRule[]) {
  const clientMap = Object.fromEntries(mockClients.map((c) => [c.id, c.name]));
  const violations: { rule: AutomationRule; campaign: (typeof mockCampaigns)[0]; client: string }[] = [];

  rules.filter((r) => r.is_active).forEach((rule) => {
    mockCampaigns.forEach((campaign) => {
      const value = rule.metric === 'cpa' ? campaign.cpa : rule.metric === 'spend' ? campaign.spend : campaign.conversions;
      const triggered =
        (rule.operator === '>' && value > rule.threshold) ||
        (rule.operator === '<' && value < rule.threshold) ||
        (rule.operator === '==' && value === rule.threshold);
      if (triggered) {
        violations.push({ rule, campaign, client: clientMap[campaign.client_id] ?? 'Desconhecido' });
      }
    });
  });

  return violations;
}

const emptyRule: Omit<AutomationRule, 'id' | 'agency_id' | 'created_at'> = {
  name: '',
  metric: 'cpa',
  operator: '>',
  threshold: 100,
  action: 'alert',
  is_active: true,
};

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>(mockAutomationRules);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyRule);

  const violations = evaluateRules(rules);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r)));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const addRule = () => {
    if (!form.name.trim()) return;
    const newRule: AutomationRule = {
      ...form,
      id: `rule-${Date.now()}`,
      agency_id: 'mock-agency-001',
      created_at: new Date().toISOString(),
    };
    setRules((prev) => [newRule, ...prev]);
    setForm(emptyRule);
    setShowForm(false);
  };

  return (
    <>
      <Header title="Automação" subtitle="Regras de Ouro para monitoramento de campanhas" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto animate-page">

        {/* Active Violations */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">
              Violações Detectadas
              {violations.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-semibold">{violations.length}</span>
              )}
            </h2>
          </div>

          {violations.length === 0 ? (
            <div className="flex items-center gap-3 py-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-[#6B7280]">Nenhuma violação encontrada. Todas as campanhas estão dentro dos limites configurados.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-50/80 transition-colors duration-150">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2937]">
                      Regra <span className="text-[#FF6B00] font-semibold">"{v.rule.name}"</span> violada
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1 truncate">
                      Campanha: {v.campaign.name} · Cliente: {v.client} · {metricLabels[v.rule.metric]}{' '}
                      {operatorLabels[v.rule.operator]} {v.rule.threshold}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-600 rounded-full shrink-0">
                    {actionLabels[v.rule.action]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF6B00]" />
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Regras de Ouro</h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-medium shadow-md shadow-orange-200 hover:bg-[#e65c00] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Nova Regra
            </button>
          </div>

          {/* New Rule Form */}
          {showForm && (
            <div className="mb-5 p-5 bg-[#FFF0E6] border border-[#FFD4A8] rounded-2xl">
              <h3 className="text-sm font-heading font-semibold text-[#FF6B00] mb-4">Criar Nova Regra</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Nome da Regra</label>
                  <input
                    type="text"
                    placeholder="Ex: CPA Alto Google"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Métrica</label>
                  <select
                    value={form.metric}
                    onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value as RuleMetric }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                  >
                    {(Object.entries(metricLabels) as [RuleMetric, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Operador</label>
                  <select
                    value={form.operator}
                    onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value as RuleOperator }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                  >
                    {(Object.entries(operatorLabels) as [RuleOperator, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Valor Limite</label>
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Ação</label>
                  <select
                    value={form.action}
                    onChange={(e) => setForm((f) => ({ ...f, action: e.target.value as RuleAction }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                  >
                    {(Object.entries(actionLabels) as [RuleAction, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={addRule}
                    disabled={!form.name.trim()}
                    className="flex-1 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-medium shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-40 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Salvar Regra
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="py-2 px-3 border border-[#E5E7EB] bg-white text-[#6B7280] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rules list */}
          <div className="space-y-2.5">
            {rules.length === 0 && (
              <div className="py-12 text-center">
                <Zap className="w-8 h-8 text-[#E5E7EB] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">Nenhuma regra criada.</p>
                <p className="text-xs text-[#D1D5DB] mt-1">Clique em "Nova Regra" para começar.</p>
              </div>
            )}
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  rule.is_active
                    ? 'bg-white border-[#E5E7EB] hover:border-[#FFD4A8] hover:shadow-sm'
                    : 'bg-[#F9FAFB] border-[#F3F4F6] opacity-55'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rule.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-semibold text-[#1F2937]">{rule.name}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      Se <strong className="text-[#6B7280]">{metricLabels[rule.metric]}</strong>{' '}
                      {operatorLabels[rule.operator]}{' '}
                      <strong className="text-[#6B7280]">{rule.threshold}</strong>{' '}
                      → {actionLabels[rule.action]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                      rule.is_active ? 'text-[#FF6B00] hover:bg-[#FFF0E6]' : 'text-[#9CA3AF] hover:bg-[#F3F4F6]'
                    }`}
                    title={rule.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {rule.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 hover:scale-110 transition-all duration-200"
                    title="Excluir regra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
