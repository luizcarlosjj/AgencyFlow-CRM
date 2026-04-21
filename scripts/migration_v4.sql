-- migration_v4: limpa colunas Google antigas da agency_oauth_config,
-- adiciona google_mcc_id (Manager Customer ID — preenchido pela agência)
-- Execute no Supabase SQL Editor

ALTER TABLE agency_oauth_config
  DROP COLUMN IF EXISTS google_client_id,
  DROP COLUMN IF EXISTS google_client_secret_enc,
  DROP COLUMN IF EXISTS google_developer_token_enc,
  ADD COLUMN IF NOT EXISTS google_mcc_id text;

COMMENT ON COLUMN agency_oauth_config.google_mcc_id IS
  'Manager Customer ID (ex: 123-456-7890). Usado como login-customer-id nas chamadas à Google Ads API.';
