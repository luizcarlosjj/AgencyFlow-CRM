'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function OAuthComplete() {
  const params = useSearchParams();
  const provider = params.get('provider');
  const error    = params.get('error');

  useEffect(() => {
    const msg = error
      ? { type: 'oauth_complete', provider, error }
      : { type: 'oauth_complete', provider, success: true };

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(msg, window.location.origin);
      setTimeout(() => window.close(), 800);
    } else {
      // Aberta sem popup — redireciona normalmente
      window.location.href = error
        ? `/automation?error=${error}`
        : `/automation?connected=${provider}`;
    }
  }, [provider, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 flex flex-col items-center gap-4 shadow-sm max-w-sm w-full mx-4">
        {error ? (
          <>
            <XCircle className="w-12 h-12 text-red-500" />
            <p className="text-[#1F2937] font-semibold text-center">Falha na conexão</p>
            <p className="text-xs text-[#9CA3AF] text-center">{error}</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-[#1F2937] font-semibold text-center">Conectado com sucesso!</p>
            <p className="text-xs text-[#9CA3AF] text-center flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Fechando esta janela…
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense>
      <OAuthComplete />
    </Suspense>
  );
}
