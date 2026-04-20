# AgencyFlow CRM — Discovery Document

## Visão do Projeto
CRM nichado para agências de marketing digital. Foco em:
- Controlo de receita e faturação recorrente
- Gestão de carteira de clientes
- Automação e monitorização de campanhas (Google Ads & Meta Ads)
- Regras de alerta inteligente (Golden Rules)

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Estilo | Tailwind CSS v4, Shadcn/UI, Lucide React |
| Gráficos | Recharts |
| Backend/DB | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel (sem Docker) |

## Paleta de Cores
- Branco: `#FFFFFF`
- Cinza Claro: `#F9FAFB`
- Laranja Claro: `#FFB380`
- Laranja Escuro/Vibrante: `#FF6B00`
- Texto Cinza Escuro: `#1F2937`

## Estrutura de Pastas
```
/src
  /app              — Next.js App Router (páginas e layouts)
  /components       — Componentes React reutilizáveis
    /ui             — Shadcn/UI base components
    /layout         — Sidebar, Header, etc.
    /modules        — Componentes de negócio (clients, campaigns, revenue)
  /lib              — Utilitários, configuração Supabase, tipos
  /services         — Camada de repositório (padrão Repository)
  /hooks            — Custom React hooks
/docs               — Documentação técnica por módulo
/scripts            — Scripts utilitários (seed, migrations)
```

## Padrão Arquitetural: Repository Pattern
Toda a lógica de base de dados passa por `/src/services/*Repository.ts`.
Isso isola o Supabase e facilita migração para Firebase ou outro SQL.

```
Componente → Hook → Service/Repository → Supabase Client
```

## Decisões Técnicas

### Por que Repository Pattern?
Permite trocar o Supabase por Firebase ou outro provider sem tocar nos componentes. Cada tabela tem um repository dedicado com interface TypeScript bem definida.

### Por que Recharts?
Biblioteca madura, compatível com React Server Components em modo client, boa documentação e integração natural com Tailwind.

### Dados de Campanhas (Phase 1)
APIs do Google Ads e Meta Ads requerem tokens OAuth e setup complexo. O MVP usa dados mockados com as mesmas interfaces TypeScript que as APIs reais usarão, garantindo uma migração sem breaking changes.

## Módulos do MVP

1. **Dashboard** — KPIs principais: receita total, clientes ativos, gasto em anúncios, ROI médio
2. **Clientes** — Tabela com status, mensalidade, próximo pagamento
3. **Campanhas** — Vista unificada Google + Meta com métricas CPA/conversões
4. **Receita** — Gráfico mensal faturação vs. metas
5. **Automação** — Regras de alerta (Golden Rules): se CPA > X → alerta

## Schema da Base de Dados
Ver [`docs/db_schema.md`](docs/db_schema.md) e [`scripts/schema.sql`](scripts/schema.sql)

## Variáveis de Ambiente
Ver [`.env.example`](.env.example)

## Progresso das Tarefas

- [x] Passo 1: Infraestrutura e Documentação Inicial
- [x] Passo 2: Schema da Base de Dados
- [x] Passo 3: Layout Base e UI
- [x] Passo 4: Funcionalidades Core
- [x] Passo 5: Scripts de Teste e Deploy
- [x] **Fase 2: Polimento Visual e PT-BR** (2026-04-20)

## Fase de Polimento Visual e PT-BR (2026-04-20)

### Objetivo
Elevar o nível visual da interface para um padrão SaaS premium e padronizar 100% do texto em Português do Brasil.

### Mudanças Realizadas

#### 1. Tipografia
- **Inter** substituiu Geist como fonte base (corpo, tabelas, menus)
- **Poppins** aplicada em todos os títulos (`h1`, `h2`, `h3`) e valores de KPI
- Configurado via `next/font/google` sem impacto no bundle client-side

#### 2. Padronização PT-BR
| Texto anterior (PT-PT) | Texto corrigido (PT-BR) |
|------------------------|------------------------|
| Activos / Activas | Ativos / Ativas |
| Contacto | Contato |
| Guardar | Salvar |
| Acção | Ação |
| Activar / Desactivar | Ativar / Desativar |
| Eliminar | Excluir |
| Facturas | Notas fiscais |
| Faturação | Faturamento |
| Monitorização | Monitoramento |
| Base de Dados | Banco de Dados |

#### 3. Estilo e Profundidade Visual
- Cards: `rounded-2xl` + `shadow-sm` + `hover:shadow-md` em todos os cards
- Botões primários: `shadow-md shadow-orange-200` + gradiente sutil
- Cards de KPI accent: `bg-gradient-to-br from-[#FF6B00] to-[#FF8C33]`
- Sidebar: fundo branco com `shadow-sm`, logo com sombra laranja suave
- Indicador activo na sidebar: barra laranja vertical `w-0.5` na esquerda
- Labels de secção: `text-xs uppercase tracking-wide text-[#9CA3AF]`
- Texto muted: `#9CA3AF` (mais suave que o anterior `#6B7280`)

#### 4. Animações e Micro-interações
- **Fade-in de página**: `@keyframes fadeInUp` — todos os `<main>` com `animate-page`
- **Cards de métrica**: `hover:-translate-y-0.5` + sombra crescente
- **Botões primários**: `hover:scale-[1.02] active:scale-[0.98]`
- **Linhas de tabela**: `hover:bg-[#FFFAF7]` (laranja ultra-suave) com `transition-all duration-150`
- **Logo da sidebar**: `hover:scale-110` com `transition-transform duration-200`
- **Botões de ação inline**: `hover:scale-110`
- **Cards Kanban**: `hover:-translate-y-px` + `hover:shadow-sm`
- **Inputs de formulário**: `focus:bg-white` com transição suave

#### 5. Responsividade
Verificada: nenhuma quebra introduzida. Grids com `grid-cols-1 sm:...` preservados em todas as páginas.

## Histórico de Decisões
| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-04-20 | Usar Recharts para gráficos | Melhor integração com Next.js App Router vs. Chart.js |
| 2026-04-20 | Mock data para Ads APIs | Evitar OAuth setup no MVP, mas mantendo interfaces reais |
| 2026-04-20 | oklch CSS substituído por hex | Hex mais legível e compatível para a paleta de marca |
| 2026-04-20 | Inter + Poppins sem framer-motion | Animações CSS puras evitam bundle extra; efeito visual equivalente |
