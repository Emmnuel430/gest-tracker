-- ========================================================
-- SCRIPT DE MIGRATION V2.16.0 POUR SUPABASE
-- GEST TRACKER — Historique des remboursements de dettes (debt_repayments),
-- liaison optionnelle avec les portefeuilles (wallet_id, transaction_id) et indexation
-- ========================================================

-- 1. Colonnes wallet_id et transaction_id sur la table debts
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'debts' AND column_name = 'wallet_id'
    ) THEN
        ALTER TABLE public.debts ADD COLUMN wallet_id TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'debts' AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE public.debts ADD COLUMN transaction_id TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'debts_wallet_id_fkey'
    ) THEN
        ALTER TABLE public.debts
        ADD CONSTRAINT debts_wallet_id_fkey
        FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS debts_wallet_id_idx ON public.debts(wallet_id);

-- 2. Table debt_repayments (Historique des versements partiels ou totaux)
CREATE TABLE IF NOT EXISTS public.debt_repayments (
    id TEXT PRIMARY KEY,
    debt_id TEXT NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    paid_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    wallet_id TEXT REFERENCES public.wallets(id) ON DELETE SET NULL,
    transaction_id TEXT,
    note TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS debt_repayments_debt_id_paid_at_idx
ON public.debt_repayments(debt_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS debt_repayments_user_id_idx
ON public.debt_repayments(user_id);

CREATE INDEX IF NOT EXISTS debt_repayments_wallet_id_idx
ON public.debt_repayments(wallet_id);

-- 3. Index composite budgets(user_id, month) pour accélérer les lectures mensuelles
CREATE INDEX IF NOT EXISTS budgets_user_id_month_idx
ON public.budgets(user_id, month);

-- 4. Activation de Row Level Security (RLS) sur public.debt_repayments
ALTER TABLE public.debt_repayments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select their own debt repayments" ON public.debt_repayments;
CREATE POLICY "Users can select their own debt repayments"
  ON public.debt_repayments FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own debt repayments" ON public.debt_repayments;
CREATE POLICY "Users can insert their own debt repayments"
  ON public.debt_repayments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can update their own debt repayments" ON public.debt_repayments;
CREATE POLICY "Users can update their own debt repayments"
  ON public.debt_repayments FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own debt repayments" ON public.debt_repayments;
CREATE POLICY "Users can delete their own debt repayments"
  ON public.debt_repayments FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);
