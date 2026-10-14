-- Migration v2.6.0: Journal des rappels des récurrences et activation/désactivation
-- Conforme aux spécifications de rm.md section 8.1 & T1

-- 1. Ajout de la colonne reminders_enabled sur recurring_rules
ALTER TABLE recurring_rules 
ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT true;

-- 2. Création de la table recurring_reminder_logs
CREATE TABLE IF NOT EXISTS recurring_reminder_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  rule_id TEXT NOT NULL REFERENCES recurring_rules(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  offset_days INT NOT NULL,
  status TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_rule_due_offset UNIQUE (rule_id, due_date, offset_days)
);

-- 3. Index d'optimisation
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user ON recurring_reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status ON recurring_reminder_logs(status);

-- 4. Sécurité RLS : Lecture seule pour l'utilisateur connecté
ALTER TABLE recurring_reminder_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reminder logs" ON recurring_reminder_logs;
CREATE POLICY "Users can view their own reminder logs"
ON recurring_reminder_logs
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);
