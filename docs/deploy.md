# Deploy na Vercel

## Pré-requisitos
1. Conta Vercel ligada ao repositório GitHub
2. Projeto Supabase criado em https://app.supabase.com
3. Schema executado no SQL Editor do Supabase (ver `scripts/schema.sql`)

## Passos

### 1. Variáveis de Ambiente na Vercel
No painel Vercel → Settings → Environment Variables, adiciona:
```
NEXT_PUBLIC_SUPABASE_URL     = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
```

### 2. Deploy
```bash
# Via CLI
npx vercel --prod

# Ou push para main → deploy automático se ligado ao GitHub
git push origin main
```

### 3. Popular a Base de Dados (opcional)
```bash
# Cria .env.local com as variáveis + SUPABASE_SERVICE_ROLE_KEY
npm run seed
```

## Notas
- Sem Docker — o Next.js corre nativamente na Vercel como serverless functions
- Todas as rotas são Static no MVP (dados mockados), zero cold starts
- Quando integrar Supabase, as páginas passarão a usar `dynamic = 'force-dynamic'` ou Server Components com fetch
