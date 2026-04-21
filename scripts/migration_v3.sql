-- migration_v3: credenciais OAuth por agência (criptografadas no servidor)
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agency_oauth_config (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id                  uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Meta Ads
  meta_app_id                text,          -- público (aparece na URL OAuth)
  meta_app_secret_enc        text,          -- criptografado (AES-256-GCM)

  -- Google Ads
  google_client_id           text,          -- público
  google_client_secret_enc   text,          -- criptografado
  google_developer_token_enc text,          -- criptografado

  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT agency_oauth_config_agency_id_key UNIQUE (agency_id)
);

-- RLS: cada agência só acessa a própria linha
ALTER TABLE agency_oauth_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner gerencia suas credenciais"
  ON agency_oauth_config FOR ALL
  USING (
    agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
  );

-- Trigger updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER agency_oauth_config_updated_at
  BEFORE UPDATE ON agency_oauth_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
