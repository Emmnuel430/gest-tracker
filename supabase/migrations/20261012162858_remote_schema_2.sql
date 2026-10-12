ALTER TABLE "public"."recurring_rules"
  ADD COLUMN "type" public."TransactionType" NOT NULL;

CREATE TYPE "public"."WalletType" AS ENUM (
  'CASH',
  'MOBILE_MONEY',
  'BANK',
  'SAVINGS'
);

ALTER TABLE "public"."wallets"
  ADD COLUMN "type" public."WalletType" NOT NULL;

ALTER TABLE "public"."transactions"
  ADD CONSTRAINT "transactions_target_wallet_id_fkey" FOREIGN KEY (target_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "public"."transactions"
  ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE UNIQUE INDEX budgets_user_id_category_month_key ON public.budgets USING btree (user_id, category, month);

CREATE INDEX budgets_user_id_month_idx ON public.budgets USING btree (user_id, month);

CREATE INDEX debts_user_id_status_idx ON public.debts USING btree (user_id, status);

CREATE INDEX recurring_rules_user_id_is_active_idx ON public.recurring_rules USING btree (user_id, is_active);

CREATE INDEX transactions_wallet_id_idx ON public.transactions USING btree (wallet_id);

CREATE INDEX wallets_user_id_idx ON public.wallets USING btree (user_id);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."budgets" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."budgets" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."budgets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."budgets" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."debts" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."debts" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."debts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."debts" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."recurring_rules" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."recurring_rules" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."recurring_rules" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."recurring_rules" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallets" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."wallets" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallets" TO "service_role";

