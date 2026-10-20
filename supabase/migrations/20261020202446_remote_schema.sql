DROP INDEX "public"."idx_recurring_rules_user_wallet";

DROP INDEX "public"."idx_recurring_rules_wallet_id";

DROP INDEX "public"."idx_reminder_logs_status";

DROP INDEX "public"."idx_reminder_logs_user";

DROP INDEX "public"."idx_transactions_user_date_id";

DROP INDEX "public"."idx_wallets_user_is_archived";

ALTER TABLE "public"."budgets"
  DROP CONSTRAINT "budgets_category_id_fkey";

ALTER TABLE "public"."recurring_reminder_logs"
  DROP CONSTRAINT "recurring_reminder_logs_rule_id_fkey";

ALTER TABLE "public"."recurring_reminder_logs"
  DROP CONSTRAINT "uq_rule_due_offset";

ALTER TABLE "public"."recurring_rules"
  DROP CONSTRAINT "recurring_rules_category_id_fkey";

ALTER TABLE "public"."transactions"
  DROP CONSTRAINT "transactions_category_id_fkey";

ALTER TABLE "public"."transactions"
  DROP CONSTRAINT "transactions_linked_transfer_id_fkey";

ALTER TABLE "public"."categories"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."categories"
  ALTER COLUMN "updated_at" DROP DEFAULT;

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."wallets"
  ADD COLUMN "declared_at" timestamp(3) WITHOUT time zone;

ALTER TABLE "public"."wallets"
  ADD COLUMN "declared_balance" numeric(12,2);

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "created_at" DROP DEFAULT;

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "created_at" TYPE timestamp(3) WITHOUT time zone USING "created_at"::timestamp(3) WITHOUT time zone;

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "sent_at" DROP DEFAULT;

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "sent_at" TYPE timestamp(3) WITHOUT time zone USING "sent_at"::timestamp(3) WITHOUT time zone;

ALTER TABLE "public"."recurring_reminder_logs"
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."budgets"
  ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."recurring_reminder_logs"
  ADD CONSTRAINT "recurring_reminder_logs_rule_id_due_date_offset_days_key" UNIQUE (rule_id, due_date, offset_days);

ALTER TABLE "public"."recurring_reminder_logs"
  ADD CONSTRAINT "recurring_reminder_logs_rule_id_fkey" FOREIGN KEY (rule_id) REFERENCES public.recurring_rules(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."recurring_rules"
  ADD CONSTRAINT "recurring_rules_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."transactions"
  ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."transactions"
  ADD CONSTRAINT "transactions_linked_transfer_id_fkey" FOREIGN KEY (linked_transfer_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX recurring_reminder_logs_status_idx ON public.recurring_reminder_logs USING btree (status);

CREATE INDEX recurring_reminder_logs_user_id_idx ON public.recurring_reminder_logs USING btree (user_id);

CREATE INDEX recurring_rules_user_id_wallet_id_idx ON public.recurring_rules USING btree (user_id, wallet_id);

CREATE INDEX recurring_rules_wallet_id_idx ON public.recurring_rules USING btree (wallet_id);

CREATE INDEX transactions_linked_transfer_id_idx ON public.transactions USING btree (linked_transfer_id);

CREATE INDEX transactions_user_id_date_id_idx ON public.transactions USING btree (user_id, date DESC, id);

CREATE INDEX wallets_user_id_is_archived_idx ON public.wallets USING btree (user_id, is_archived);

