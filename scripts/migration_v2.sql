-- ============================================================
-- AgencyFlow CRM — Migration V2: Rules Engine + Integrations
-- Execute no Supabase SQL Editor APÓS migration.sql
-- ============================================================

-- ─── 1. Tokens de integração OAuth ──────────────────────────
CREATE TABLE IF NOT EXISTS integration_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,          -- 'meta' | 'google_ads'
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  expires_at  TIMESTAMPTZ,
  account_id  TEXT,                   -- ID da conta de Ads na plataforma
  account_name TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, provider)
);

ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency manages own tokens"
  ON integration_tokens FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- ─── 2. Expandir automation_rules para condições compostas ──
ALTER TABLE automation_rules
  ADD COLUMN IF NOT EXISTS description    TEXT,
  ADD COLUMN IF NOT EXISTS platform       TEXT DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS entity_level   TEXT DEFAULT 'campaign',
  ADD COLUMN IF NOT EXISTS condition_group JSONB,
  ADD COLUMN IF NOT EXISTS action_config  JSONB,
  ADD COLUMN IF NOT EXISTS template       TEXT,
  ADD COLUMN IF NOT EXISTS schedule       JSONB;

-- ─── 3. Logs de execução do motor de regras ──────────────────
CREATE TABLE IF NOT EXISTS automation_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id          UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  agency_id        UUID NOT NULL,
  rule_name        TEXT NOT NULL,
  platform         TEXT,
  entity_id        TEXT,
  entity_name      TEXT,
  entity_level     TEXT,
  metrics_snapshot JSONB,
  conditions_met   BOOLEAN NOT NULL,
  action_taken     TEXT,
  success          BOOLEAN DEFAULT TRUE,
  error_message    TEXT,
  mock_mode        BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency views own logs"
  ON automation_logs FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- Index para queries de log por agência
CREATE INDEX IF NOT EXISTS automation_logs_agency_idx ON automation_logs(agency_id, created_at DESC);
