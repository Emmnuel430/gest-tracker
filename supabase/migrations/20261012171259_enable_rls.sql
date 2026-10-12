-- Migration: Enable Row Level Security (RLS) on all user data tables
-- Tables concernées : transactions, wallets, budgets, recurring_rules, debts

-- 1. Activation de RLS sur les 5 tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 2. Politiques de sécurité pour public.transactions
CREATE POLICY "Users can select their own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- 3. Politiques de sécurité pour public.wallets
CREATE POLICY "Users can select their own wallets"
  ON public.wallets FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own wallets"
  ON public.wallets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own wallets"
  ON public.wallets FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own wallets"
  ON public.wallets FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- 4. Politiques de sécurité pour public.budgets
CREATE POLICY "Users can select their own budgets"
  ON public.budgets FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON public.budgets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own budgets"
  ON public.budgets FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON public.budgets FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- 5. Politiques de sécurité pour public.recurring_rules
CREATE POLICY "Users can select their own recurring rules"
  ON public.recurring_rules FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own recurring rules"
  ON public.recurring_rules FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own recurring rules"
  ON public.recurring_rules FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own recurring rules"
  ON public.recurring_rules FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- 6. Politiques de sécurité pour public.debts
CREATE POLICY "Users can select their own debts"
  ON public.debts FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own debts"
  ON public.debts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own debts"
  ON public.debts FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own debts"
  ON public.debts FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);
