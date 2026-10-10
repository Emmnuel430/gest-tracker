-- ========================================================
-- SCRIPT DE MIGRATION V2 POUR SUPABASE (PRODUCTION)
-- GEST TRACKER — Sprints 12 à 20
-- Ce script est idempotent et sécurisé (ne supprime aucune donnée existante)
-- ========================================================

-- 1. ENUMS (Types personnalisés PostgreSQL)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
        CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
    ELSE
        -- Ajout de la valeur TRANSFER si le type existait déjà en V1
        ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'TRANSFER';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WalletType') THEN
        CREATE TYPE "WalletType" AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK', 'SAVINGS');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RecurrenceFrequency') THEN
        CREATE TYPE "RecurrenceFrequency" AS ENUM ('MONTHLY', 'WEEKLY', 'YEARLY');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DebtType') THEN
        CREATE TYPE "DebtType" AS ENUM ('LENT', 'BORROWED');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DebtStatus') THEN
        CREATE TYPE "DebtStatus" AS ENUM ('PENDING', 'PARTIAL', 'SETTLED');
    END IF;
END $$;

-- 2. TABLE DES PORTEFEUILLES (WALLETS)
CREATE TABLE IF NOT EXISTS "wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WalletType" NOT NULL,
    "initial_balance" DECIMAL(12, 2) NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#2563EB',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "wallets_user_id_idx" ON "wallets"("user_id");

-- 3. MISE À JOUR DE LA TABLE TRANSACTIONS
-- Ajout de user_id si absent
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "user_id" TEXT;
    END IF;
END $$;

-- Ajout de wallet_id et target_wallet_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'wallet_id'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "wallet_id" TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'target_wallet_id'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "target_wallet_id" TEXT;
    END IF;
END $$;

-- Clés étrangères sur transactions vers wallets
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_wallet_id_fkey'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_wallet_id_fkey" 
        FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_target_wallet_id_fkey'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_target_wallet_id_fkey" 
        FOREIGN KEY ("target_wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX IF NOT EXISTS "transactions_wallet_id_idx" ON "transactions"("wallet_id");

-- 4. TABLE DES BUDGETS (BUDGETS)
CREATE TABLE IF NOT EXISTS "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "month" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "budgets_user_id_category_month_key" 
ON "budgets"("user_id", "category", "month");

CREATE INDEX IF NOT EXISTS "budgets_user_id_month_idx" 
ON "budgets"("user_id", "month");

-- 5. TABLE DES RÈGLES RÉCURRENTES (RECURRING_RULES)
CREATE TABLE IF NOT EXISTS "recurring_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "category" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "day_of_month" INTEGER NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY',
    "note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_processed_month" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "recurring_rules_user_id_is_active_idx" 
ON "recurring_rules"("user_id", "is_active");

-- 6. TABLE DES DETTES & CRÉANCES (DEBTS)
CREATE TABLE IF NOT EXISTS "debts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "person_name" TEXT NOT NULL,
    "type" "DebtType" NOT NULL,
    "initial_amount" DECIMAL(12, 2) NOT NULL,
    "remaining_amount" DECIMAL(12, 2) NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "DebtStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "debts_user_id_status_idx" 
ON "debts"("user_id", "status");

-- Message de fin de script
DO $$ BEGIN
    RAISE NOTICE 'Migration V2 appliquée avec succès sur Supabase !';
END $$;
