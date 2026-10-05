CREATE TABLE "public"."transactions" (
  "id"         text                           NOT NULL,
  "amount"     numeric(12,2)                  NOT NULL,
  "category"   text                           NOT NULL,
  "payment"    text                           NOT NULL,
  "note"       text,
  "date"       timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id"    text,
  "created_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) without time zone NOT NULL,
  CONSTRAINT "transactions_pkey" PRIMARY KEY (id)
);

CREATE TYPE "public"."TransactionType" AS ENUM (
  'INCOME',
  'EXPENSE'
);

ALTER TABLE "public"."transactions"
  ADD COLUMN "type" public."TransactionType" NOT NULL;

CREATE INDEX transactions_category_idx ON public.transactions USING btree (category);

CREATE INDEX transactions_date_idx ON public.transactions USING btree (date DESC);

CREATE INDEX transactions_date_type_idx ON public.transactions USING btree (date, TYPE);

CREATE INDEX transactions_payment_idx ON public.transactions USING btree (payment);

CREATE INDEX transactions_type_idx ON public.transactions USING btree (TYPE);

CREATE INDEX transactions_user_id_idx ON public.transactions USING btree (user_id);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."transactions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "service_role";

