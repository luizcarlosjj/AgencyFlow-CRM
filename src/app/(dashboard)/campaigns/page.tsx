'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Play, Pause, PencilLine, ChevronRight,
  Loader2, AlertCircle, BarChart2, Wifi, WifiOff,
} from 'lucide-react';
import { useAgencyContext } from '@/components/providers/AgencyProvider';
import { useClients } from '@/hooks/useClients';
import type { Client, LiveCampaign } from '@/lib/types';

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Inline Budget Editor ─────────────────────────────────────────────────────

function BudgetEditor({
  campaign,
  clientId,
  customerId,
  onSaved,
}: {
  campaign: LiveCampaign;
  clientId: string;
  customerId?: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(String(campaign.daily_budget.toFixed(2)));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num <= 0) { setErr('Valor inválido'); return; }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/campaigns/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: campaign.platform,
          client_id: clientId,
          campaign_id: campaign.external_id,
          action: 'update_budget',
          daily_budget_brl: num,
          customer_id: customerId,
          budget_resource: campaign.budget_resource,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Erro ao salvar');
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[#9CA3AF]">R$</span>
      <input
        type="number"
        min="1"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 px-2 py-1 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
      <button
        onClick={save}
        disabled={saving}
        className="px-2.5 py-1 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e65c00] disabled:opacity-60 transition-colors"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'OK'}
      </button>
      {err && <span className="text-xs text-red-500">{err}</span>}
    </div>
  );
}

// ─── Campaign Row ─────────────────────────────────────────────────────────────

function CampaignRow({
  c,
  clientId,
  customerId,
  onAction,
}: {
  c: LiveCampaign;
  clientId: string;
  customerId?: string;
  onAction: () => void;
}) {
  const [actioning, setActioning] = useState(false);
  const [editBudget, setEditBudget] = useState(false);
  const isActive = c.status === 'ACTIVE' || c.status === 'ENABLED';

  const toggleStatus = async () => {
    setActioning(true);
    try {
      const res = await fetch('/api/campaigns/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: c.platform,
          client_id: clientId,
          campaign_id: c.external_id,
          action: isActive ? 'pause' : 'enable',
          customer_id: customerId,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onAction();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao atualizar campanha');
    } finally {
      setActioning(false);
    }
  };

  const platformBadge = c.platform === 'google'
    ? 'bg-blue-50 text-blue-700'
    : 'bg-indigo-50 text-indigo-700';

  const statusBadge = isActive
    ? 'bg-green-50 text-green-700'
    : 'bg-yellow-50 text-yellow-700';

  return (
    <tr className="hover:bg-[#FAFAFA] transition-colors group">
      <td className="px-4 py-3">
        <div className="font-medium text-[#1F2937] text-sm leading-snug">{c.name}</div>
        <div className="text-xs text-[#9CA3AF] font-mono mt-0.5 truncate max-w-[200px]">{c.external_id}</div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformBadge}`}>
          {c.platform === 'google' ? 'Google Ads' : 'Meta Ads'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge}`}>
          {isActive ? 'Ativa' : 'Pausada'}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        {editBudget ? (
          <BudgetEditor
            campaign={c}
            clientId={clientId}
            customerId={customerId}
            onSaved={() => { setEditBudget(false); onAction(); }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#1F2937]">{fmtBRL(c.daily_budget)}/dia</span>
            <button
              onClick={() => setEditBudget(true)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[#F3F4F6] transition-all"
            >
              <PencilLine className="w-3 h-3 text-[#9CA3AF]" />
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleStatus}
            disabled={actioning}
            title={isActive ? 'Pausar campanha' : 'Ativar campanha'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              isActive
                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {actioning
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isActive ? 'Pausar' : 'Ativar'}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Client Sidebar Item ──────────────────────────────────────────────────────

function ClientItem({
  client,
  selected,
  onClick,
}: {
  client: Client;
  selected: boolean;
  onClick: () => void;
}) {
  const hasGoogle = !!client.google_customer_id;
  const hasMeta   = !!client.meta_ad_account_id;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
        selected ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'hover:bg-[#F9FAFB] text-[#374151]'
      }`}
    >
      <div className="min-w-0">
        <div className={`text-sm font-medium truncate ${selected ? 'text-[#FF6B00]' : 'text-[#1F2937]'}`}>
          {client.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {hasGoogle ? (
            <Wifi className="w-3 h-3 text-blue-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-[#D1D5DB]" />
          )}
          <span className="text-xs text-[#9CA3AF]">G</span>
          {hasMeta ? (
            <Wifi className="w-3 h-3 text-indigo-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-[#D1D5DB]" />
          )}
          <span className="text-xs text-[#9CA3AF]">M</span>
        </div>
      </div>
      {selected && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const { agency } = useAgencyContext();
  const { clients, loading: clientsLoading } = useClients(agency.id);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [campaigns, setCampaigns] = useState<LiveCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignError, setCampaignError] = useState('');
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'google' | 'meta'>('all');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // auto-select first client once loaded
  useEffect(() => {
    if (!selectedClient && clients.length > 0) setSelectedClient(clients[0]);
  }, [clients, selectedClient]);

  const fetchCampaigns = useCallback(async (client: Client, force = false) => {
    setLoadingCampaigns(true);
    setCampaignError('');
    try {
      const qs = force ? '?force=true' : '';
      const res = await fetch(`/api/clients/${client.id}/campaigns${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao buscar campanhas');
      setCampaigns(data.campaigns ?? []);
      setLastSynced(new Date());
    } catch (e) {
      setCampaignError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClient) fetchCampaigns(selectedClient);
  }, [selectedClient, fetchCampaigns]);

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === 'all' || c.platform === platformFilter;
    return matchSearch && matchPlatform;
  });

  const connectedClients = clients.filter((c) => c.google_customer_id || c.meta_ad_account_id);
  const otherClients     = clients.filter((c) => !c.google_customer_id && !c.meta_ad_account_id);

  return (
    <main className="flex-1 flex overflow-hidden h-full animate-page">

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 border-r border-[#F3F4F6] bg-white flex flex-col">
        <div className="p-4 border-b border-[#F3F4F6]">
          <h1 className="text-sm font-heading font-bold text-[#1F2937]">Campanhas ao Vivo</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Selecione um cliente</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {clientsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#D1D5DB]" /></div>
          ) : clients.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] text-center py-8 px-2">Nenhum cliente cadastrado</p>
          ) : (
            <>
              {connectedClients.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-2 py-1.5">Conectados</p>
                  {connectedClients.map((c) => (
                    <ClientItem
                      key={c.id}
                      client={c}
                      selected={selectedClient?.id === c.id}
                      onClick={() => setSelectedClient(c)}
                    />
                  ))}
                </>
              )}
              {otherClients.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-2 py-1.5 mt-2">Sem conta vinculada</p>
                  {otherClients.map((c) => (
                    <ClientItem
                      key={c.id}
                      client={c}
                      selected={selectedClient?.id === c.id}
                      onClick={() => setSelectedClient(c)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F3F4F6] bg-white flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">
              {selectedClient?.name ?? 'Selecione um cliente'}
            </h2>
            {lastSynced && (
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Atualizado às {lastSynced.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Platform filter */}
            <div className="flex bg-[#F9FAFB] rounded-xl p-1 gap-0.5">
              {(['all', 'google', 'meta'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    platformFilter === p ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {p === 'all' ? 'Todas' : p === 'google' ? 'Google' : 'Meta'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar campanha..."
                className="pl-8 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all w-52"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => selectedClient && fetchCampaigns(selectedClient, true)}
              disabled={loadingCampaigns || !selectedClient}
              className="p-2 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all disabled:opacity-50"
              title="Forçar atualização"
            >
              <RefreshCw className={`w-4 h-4 text-[#6B7280] ${loadingCampaigns ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedClient ? (
            <div className="flex flex-col items-center justify-center h-full text-[#9CA3AF]">
              <BarChart2 className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Selecione um cliente na barra lateral</p>
            </div>
          ) : !selectedClient.google_customer_id && !selectedClient.meta_ad_account_id ? (
            <div className="flex flex-col items-center justify-center h-full text-[#9CA3AF]">
              <WifiOff className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Nenhuma conta de anúncios vinculada</p>
              <p className="text-xs mt-1">Edite o cliente em Clientes para adicionar os IDs de conta.</p>
            </div>
          ) : loadingCampaigns ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            </div>
          ) : campaignError ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">{campaignError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#9CA3AF]">
              <BarChart2 className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">
                {search || platformFilter !== 'all' ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha ativa'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">
                  {filtered.length} campanha{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F3F4F6]">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Campanha</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden sm:table-cell">Plataforma</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide hidden md:table-cell">Orçamento/dia</th>
                    <th className="px-4 py-2.5 w-28" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.map((c) => (
                    <CampaignRow
                      key={`${c.platform}-${c.external_id}`}
                      c={c}
                      clientId={selectedClient.id}
                      customerId={selectedClient.google_customer_id}
                      onAction={() => fetchCampaigns(selectedClient, true)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
