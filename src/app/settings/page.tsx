import Header from '@/components/layout/Header';
import { Settings, Database, Key, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <Header title="Configurações" subtitle="Preferências da agência e integrações" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-2xl">

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-base font-semibold text-[#1F2937]">Agência</h2>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1 block">Nome da Agência</label>
            <input defaultValue="AgencyFlow Demo" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1 block">Meta Mensal (R$)</label>
            <input type="number" defaultValue={80000} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <button className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors">
            Guardar Alterações
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-base font-semibold text-[#1F2937]">Integrações de Anúncios</h2>
          </div>
          {[
            { name: 'Google Ads', description: 'Puxar métricas automaticamente', connected: false },
            { name: 'Meta Ads', description: 'Puxar métricas automaticamente', connected: false },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{integration.name}</p>
                <p className="text-xs text-[#6B7280]">{integration.description}</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-medium border border-[#FF6B00] text-[#FF6B00] rounded-lg hover:bg-[#FFF0E6] transition-colors">
                Conectar
              </button>
            </div>
          ))}
          <p className="text-xs text-[#6B7280] italic">Integrações OAuth em desenvolvimento. O MVP usa dados de demonstração.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-base font-semibold text-[#1F2937]">Base de Dados (Supabase)</h2>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1 block">Supabase URL</label>
            <input placeholder="https://xxx.supabase.co" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1 block">Anon Key</label>
            <input type="password" placeholder="eyJ..." className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <p className="text-xs text-[#6B7280]">Configure estas variáveis em <code className="font-mono bg-[#F3F4F6] px-1 rounded">.env.local</code> para deploy.</p>
        </div>

      </main>
    </>
  );
}
