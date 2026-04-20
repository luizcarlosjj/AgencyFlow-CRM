-- AgencyFlow CRM — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- AGENCIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agencies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  logo        TEXT,
  settings    JSONB DEFAULT '{"currency": "BRL", "monthly_goal": 50000}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency owners can manage their agency"
  ON agencies FOR ALL
  USING (auth.uid()::text = id::text);

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id          UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned')),
  monthly_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
  contact_email      TEXT,
  next_payment_date  DATE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_agency_id ON clients(agency_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency can manage its clients"
  ON clients FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE auth.uid()::text = id::text));

-- ─────────────────────────────────────────
-- CAMPAIGNS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('google', 'meta')),
  spend         NUMERIC(10,2) NOT NULL DEFAULT 0,
  conversions   INTEGER NOT NULL DEFAULT 0,
  cpa           NUMERIC(10,2) GENERATED ALWAYS AS (
                  CASE WHEN conversions > 0 THEN spend / conversions ELSE 0 END
                ) STORED,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  period_start  DATE,
  period_end    DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_client_id ON campaigns(client_id);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency can manage campaigns via clients"
  ON campaigns FOR ALL
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agencies a ON a.id = c.agency_id
      WHERE auth.uid()::text = a.id::text
    )
  );

-- ─────────────────────────────────────────
-- REVENUE LOGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  value       NUMERIC(10,2) NOT NULL DEFAULT 0,
  date        DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revenue_logs_client_date ON revenue_logs(client_id, date);

ALTER TABLE revenue_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency can manage revenue logs via clients"
  ON revenue_logs FOR ALL
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agencies a ON a.id = c.agency_id
      WHERE auth.uid()::text = a.id::text
    )
  );

-- ─────────────────────────────────────────
-- AUTOMATION RULES (Golden Rules)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  metric      TEXT NOT NULL CHECK (metric IN ('cpa', 'spend', 'conversions')),
  operator    TEXT NOT NULL CHECK (operator IN ('>', '<', '==')),
  threshold   NUMERIC NOT NULL,
  action      TEXT NOT NULL DEFAULT 'alert' CHECK (action IN ('alert', 'pause')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_agency ON automation_rules(agency_id);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency can manage its rules"
  ON automation_rules FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE auth.uid()::text = id::text));
