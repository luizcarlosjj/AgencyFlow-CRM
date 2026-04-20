-- ============================================================
-- AgencyFlow CRM — Migration: RLS corrigido + auto-agência
-- Execute no Supabase SQL Editor APÓS o schema.sql inicial
-- ============================================================

-- ─── 1. Adicionar owner_id em agencies ───────────────────────────────
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS agencies_owner_id_idx ON agencies(owner_id);

-- ─── 2. Recriar políticas RLS com owner_id correto ───────────────────

-- Agencies
DROP POLICY IF EXISTS "Agency owners can manage their agency" ON agencies;
CREATE POLICY "Agency owners can manage their agency"
  ON agencies FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Clients
DROP POLICY IF EXISTS "Agency can manage its clients" ON clients;
CREATE POLICY "Agency can manage its clients"
  ON clients FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- Campaigns
DROP POLICY IF EXISTS "Agency can manage campaigns via clients" ON campaigns;
CREATE POLICY "Agency can manage campaigns via clients"
  ON campaigns FOR ALL
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agencies a ON a.id = c.agency_id
      WHERE a.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agencies a ON a.id = c.agency_id
      WHERE a.owner_id = auth.uid()
    )
  );

-- Revenue logs
DROP POLICY IF EXISTS "Agency can manage revenue logs via clients" ON revenue_logs;
CREATE POLICY "Agency can manage revenue logs via clients"
  ON revenue_logs FOR ALL
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agencies a ON a.id = c.agency_id
      WHERE a.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN agencies a ON a.id = c.agency_id
      WHERE a.owner_id = auth.uid()
    )
  );

-- Automation rules
DROP POLICY IF EXISTS "Agency can manage its rules" ON automation_rules;
CREATE POLICY "Agency can manage its rules"
  ON automation_rules FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- ─── 3. Trigger: criar agência automaticamente ao cadastrar usuário ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.agencies (owner_id, name, settings)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Minha Agência'),
    '{"currency": "BRL", "monthly_goal": 50000}'::jsonb
  )
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. Garantir RLS habilitado em todas as tabelas ──────────────────
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
