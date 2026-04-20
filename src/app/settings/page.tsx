import Header from '@/components/layout/Header';
import { Settings, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <Header title="Configurações" subtitle="Preferências da agência e integrações" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto animate-page max-w-2xl">

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">Agência</h2>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Nome da Agência</label>
            <input
              defaultValue="AgencyFlow Demo"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Meta Mensal (R$)</label>
            <input
              type="number"
              defaultValue={80000}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
            />
          </div>
          <button className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-medium shadow-md shadow-orange-200 hover:bg-[#e65c00] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Salvar Alterações
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
              <Key className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">Integrações de Anúncios</h2>
          </div>
          {[
            { name: 'Google Ads', description: 'Importar métricas automaticamente via API' },
            { name: 'Meta Ads', description: 'Importar métricas automaticamente via API' },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-[#FFD4A8] transition-colors duration-200">
              <div>
                <p className="text-sm font-semibold text-[#1F2937]">{integration.name}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{integration.description}</p>
              </div>
              <button className="px-3.5 py-1.5 text-xs font-semibold border border-[#FF6B00] text-[#FF6B00] rounded-xl hover:bg-[#FFF0E6] hover:scale-[1.03] transition-all duration-200">
                Conectar
              </button>
            </div>
          ))}
          <p className="text-xs text-[#9CA3AF] italic">Integrações OAuth em desenvolvimento. O MVP utiliza dados de demonstração.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
              <Database className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">Banco de Dados (Supabase)</h2>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">URL do Supabase</label>
            <input
              placeholder="https://xxx.supabase.co"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#9CA3AF] mb-1.5 block uppercase tracking-wide">Chave Anon</label>
            <input
              type="password"
              placeholder="eyJ..."
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
            />
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Configure estas variáveis no arquivo{' '}
            <code className="font-mono bg-[#F3F4F6] px-1.5 py-0.5 rounded-md text-[#374151]">.env.local</code>{' '}
            para o deploy na Vercel.
          </p>
        </div>

      </main>
    </>
  );
}
