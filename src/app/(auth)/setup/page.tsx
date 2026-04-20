'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Building2, Target, Loader2 } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('50000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nome da agência é obrigatório.'); return; }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { error: insertError } = await supabase
        .from('agencies')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          settings: {
            currency: 'BRL',
            monthly_goal: parseFloat(goal) || 50000,
          },
        });

      if (insertError) throw insertError;

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0E6] via-white to-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-lg shadow-orange-200">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-heading font-bold text-[#1F2937] text-2xl tracking-tight">
            Agency<span className="text-[#FF6B00]">Flow</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-[#F3F4F6] p-8">
          <div className="mb-6">
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">Configure sua agência</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Primeiro acesso — preencha os dados para começar</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block uppercase tracking-wide">
                Nome da Agência *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Minha Agência Digital"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block uppercase tracking-wide">
                Meta Mensal de Receita (R$)
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="50000"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">Pode alterar depois em Configurações</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Criando...' : 'Entrar no Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#D1D5DB] mt-6">
          © {new Date().getFullYear()} AgencyFlow · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
