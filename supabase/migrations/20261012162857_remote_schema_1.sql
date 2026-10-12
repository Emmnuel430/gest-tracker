CREATE TABLE "public"."budgets" (
  "id"         text                           NOT NULL,
  "user_id"    text                           NOT NULL,
  "category"   text                           NOT NULL,
  "amount"     numeric(12,2)                  NOT NULL,
  "month"      text                           NOT NULL,
  "created_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) without time zone NOT NULL,
  CONSTRAINT "budgets_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."debts" (
  "id"               text                           NOT NULL,
  "user_id"          text                           NOT NULL,
  "person_name"      text                           NOT NULL,
  "initial_amount"   numeric(12,2)                  NOT NULL,
  "remaining_amount" numeric(12,2)                  NOT NULL,
  "due_date"         timestamp(3) without time zone,
  "note"             text,
  "created_at"       timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       timestamp(3) without time zone NOT NULL,
  CONSTRAINT "debts_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."recurring_rules" (
  "id"                   text                           NOT NULL,
  "user_id"              text                           NOT NULL,
  "amount"               numeric(12,2)                  NOT NULL,
  "category"             text                           NOT NULL,
  "payment"              text                           NOT NULL,
  "day_of_month"         integer                        NOT NULL,
  "note"                 text,
  "is_active"            boolean                        NOT NULL DEFAULT true,
  "last_processed_month" text,
  "created_at"           timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           timestamp(3) without time zone NOT NULL,
  CONSTRAINT "recurring_rules_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."wallets" (
  "id"              text                           NOT NULL,
  "user_id"         text                           NOT NULL,
  "name"            text                           NOT NULL,
  "initial_balance" numeric(12,2)                  NOT NULL DEFAULT 0,
  "color"           text                           NOT NULL DEFAULT '#2563EB'::text,
  "is_default"      boolean                        NOT NULL DEFAULT false,
  "created_at"      timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      timestamp(3) without time zone NOT NULL,
  CONSTRAINT "wallets_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."transactions"
  ADD COLUMN "target_wallet_id" text;

ALTER TABLE "public"."transactions"
  ADD COLUMN "wallet_id" text;

CREATE TYPE "public"."DebtStatus" AS ENUM (
  'PENDING',
  'PARTIAL',
  'SETTLED'
);

ALTER TABLE "public"."debts"
  ADD COLUMN "status" public."DebtStatus" NOT NULL DEFAULT 'PENDING'::public."DebtStatus";

CREATE TYPE "public"."DebtType" AS ENUM (
  'LENT',
  'BORROWED'
);

ALTER TABLE "public"."debts"
  ADD COLUMN "type" public."DebtType" NOT NULL;

CREATE TYPE "public"."RecurrenceFrequency" AS ENUM (
  'MONTHLY',
  'WEEKLY',
  'YEARLY'
);

ALTER TABLE "public"."recurring_rules"
  ADD COLUMN "frequency" public."RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY'::public."RecurrenceFrequency";

ALTER TYPE "public"."TransactionType" ADD VALUE 'TRANSFER' AFTER 'EXPENSE';

