import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/meta — inicia o fluxo OAuth do Meta
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const agencyId = searchParams.get('agency_id');
  if (!agencyId) return NextResponse.json({ error: 'agency_id obrigatório' }, { status: 400 });

  const params = new URLSearchParams({
    client_id:     process.env.META_APP_ID ?? '',
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
    scope:         'ads_management,ads_read,business_management',
    response_type: 'code',
    state:         agencyId,
  });

  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
}
