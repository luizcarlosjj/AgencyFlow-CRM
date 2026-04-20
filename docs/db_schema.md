# Database Schema — AgencyFlow CRM

## Entidades e Relações

```
agencies (1) ──── (N) clients (1) ──── (N) campaigns
                         │
                         └──── (N) revenue_logs
```

## Tabelas

### `agencies`
Representa a própria agência de marketing que usa o sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | Identificador único |
| name | TEXT | Nome da agência |
| logo | TEXT | URL do logótipo |
| settings | JSONB | Configurações (moeda, meta mensal, etc.) |
| created_at | TIMESTAMPTZ | Data de criação |

### `clients`
Clientes geridos pela agência.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | Identificador único |
| agency_id | UUID FK → agencies.id | Agência proprietária |
| name | TEXT | Nome do cliente/empresa |
| status | TEXT | 'active' \| 'paused' \| 'churned' |
| monthly_fee | NUMERIC(10,2) | Mensalidade em R$ |
| contact_email | TEXT | Email de contacto |
| next_payment_date | DATE | Próxima data de pagamento |
| created_at | TIMESTAMPTZ | Data de criação |

### `campaigns`
Campanhas de anúncios (Google Ads ou Meta Ads) associadas a um cliente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | Identificador único |
| client_id | UUID FK → clients.id | Cliente dono da campanha |
| name | TEXT | Nome da campanha |
| platform | TEXT | 'google' \| 'meta' |
| spend | NUMERIC(10,2) | Gasto total em R$ |
| conversions | INTEGER | Número de conversões |
| cpa | NUMERIC(10,2) | Custo por aquisição (spend/conversions) |
| status | TEXT | 'active' \| 'paused' \| 'ended' |
| period_start | DATE | Início do período |
| period_end | DATE | Fim do período |
| created_at | TIMESTAMPTZ | Data de criação |

### `revenue_logs`
Registo mensal de receita por cliente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | Identificador único |
| client_id | UUID FK → clients.id | Cliente |
| value | NUMERIC(10,2) | Valor faturado |
| date | DATE | Mês de referência (dia 1 do mês) |
| status | TEXT | 'paid' \| 'pending' \| 'overdue' |
| created_at | TIMESTAMPTZ | Data de criação |

### `automation_rules`
Regras de alerta automático (Golden Rules).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | Identificador único |
| agency_id | UUID FK → agencies.id | Agência |
| name | TEXT | Nome da regra |
| metric | TEXT | Métrica monitorizada (cpa, spend, conversions) |
| operator | TEXT | '>' \| '<' \| '==' |
| threshold | NUMERIC | Valor limite |
| action | TEXT | 'alert' \| 'pause' |
| is_active | BOOLEAN | Regra activa ou não |
| created_at | TIMESTAMPTZ | Data de criação |

## Row Level Security (RLS)
Todas as tabelas têm RLS habilitado. As políticas garantem que cada agência só acede aos seus próprios dados via `auth.uid()`.

## Índices Relevantes
- `clients(agency_id)` — listagem de clientes por agência
- `campaigns(client_id)` — campanhas por cliente
- `revenue_logs(client_id, date)` — histórico de receita
