# Módulos do AgencyFlow CRM

## Dashboard (`/`)
Vista geral da agência com KPIs, gráfico de receita e campanhas em destaque.
- Componentes: `MetricCard`, `RevenueChart`, tabela de campanhas, painel de alertas
- Dados: `mockDashboardKPIs`, `mockRevenueByMonth`, `mockCampaigns`

## Clientes (`/clients`)
Gestão da carteira de clientes com filtros por status e pesquisa.
- Funcionalidades: filtro por status, pesquisa por nome, MRR total, churn rate
- Futura integração: `clientRepository.getAll(agencyId)`

## Campanhas (`/campaigns`)
Vista unificada Google Ads + Meta Ads. Inclui kanban por plataforma e tabela completa.
- Funcionalidades: filtro por plataforma, destaque de CPA acima do limite, Kanban lateral
- Futura integração: `campaignRepository.getAll(agencyId)`

## Receita (`/revenue`)
Histórico de faturação, meta do mês com barra de progresso, breakdown por cliente.
- Funcionalidades: KPIs do mês, gráfico histórico, tabela por cliente com participação %
- Futura integração: `revenueRepository.getByMonth(agencyId, month)`

## Automação (`/automation`)
Regras de Ouro — cria, activa/desactiva e elimina regras de alerta com avaliação em tempo real.
- Funcionalidades: formulário inline, toggle de activação, avaliação de violações nos dados mockados
- Futura integração: `automationRepository.create(rule)`

## Configurações (`/settings`)
Preferências da agência, integrações Google/Meta Ads e configuração Supabase.
- Estado: UI visual apenas — formulários não persistem (sem auth no MVP)
