-- migration_v5: vincula clientes às contas de anúncios, cache de campanhas,
--               e escopo de cliente nas regras de automação.
-- Execute no Supabase SQL Editor

-- 1. Contas de anúncios por cliente
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS google_customer_id text,
  ADD COLUMN IF NOT EXISTS meta_ad_account_id  text;

COMMENT ON COLUMN clients.google_customer_id IS 'ID da sub-conta Google Ads (ex: 1234567890)';
COMMENT ON COLUMN clients.meta_ad_account_id  IS 'ID da conta Meta Ads (ex: act_1234567890)';

-- 2. Cache de campanhas (TTL: 5 min, gerenciado pelo servidor)
CREATE TABLE IF NOT EXISTS campaign_cache (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id  uuid        NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id  uuid        NOT NULL REFERENCES clients(id)  ON DELETE CASCADE,
  platform   text        NOT NULL CHECK (platform IN ('google', 'meta')),
  campaigns  jsonb       NOT NULL DEFAULT '[]',
  synced_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_cache_client_platform_key UNIQUE (client_id, platform)
);

ALTER TABLE campaign_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner acessa cache de campanhas"
  ON campaign_cache FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- 3. Escopo de cliente nas regras de automação (opcional)
ALTER TABLE automation_rules
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE SET NULL;

COMMENT ON COLUMN automation_rules.client_id IS
  'Quando preenchido, a regra executa apenas na conta deste cliente';
