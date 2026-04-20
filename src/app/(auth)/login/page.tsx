'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, Chrome } from 'lucide-react';

type Mode = 'login' | 'register' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
        });
        if (error) throw error;
        setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
        setLoading(false);
        return;
      }

      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      const translated: Record<string, string> = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
        'User already registered': 'Este e-mail já está cadastrado.',
        'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
      };
      setError(translated[msg] ?? msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      setError('Erro ao conectar com Google. Tente novamente.');
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    login: 'Bem-vindo de volta',
    register: 'Criar sua conta',
    reset: 'Recuperar senha',
  };

  const subtitles: Record<Mode, string> = {
    login: 'Entre para acessar seu CRM',
    register: 'Comece gratuitamente hoje',
    reset: 'Enviaremos um link para seu e-mail',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0E6] via-white to-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">{titles[mode]}</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">{subtitles[mode]}</p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block uppercase tracking-wide">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block uppercase tracking-wide">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-[#FF6B00] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-200 hover:bg-[#e65c00] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading
                ? 'Aguarde...'
                : mode === 'login'
                ? 'Entrar'
                : mode === 'register'
                ? 'Criar conta'
                : 'Enviar link de recuperação'}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#F3F4F6]" />
                <span className="text-xs text-[#9CA3AF]">ou continue com</span>
                <div className="flex-1 h-px bg-[#F3F4F6]" />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] disabled:opacity-60 transition-all duration-200"
              >
                <Chrome className="w-4 h-4 text-[#4285F4]" />
                Continuar com Google
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-[#9CA3AF]">
            {mode === 'login' ? (
              <>
                Não tem conta?{' '}
                <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-[#FF6B00] font-semibold hover:underline">
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-[#FF6B00] font-semibold hover:underline">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#D1D5DB] mt-6">
          © {new Date().getFullYear()} AgencyFlow · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
