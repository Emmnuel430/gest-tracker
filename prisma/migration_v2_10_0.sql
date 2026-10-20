-- ========================================================
-- SCRIPT DE MIGRATION V2.10.0 POUR SUPABASE (PRODUCTION)
-- GEST TRACKER — Frais de virement et suppression réversible des portefeuilles
-- Ce script est strictement idempotent et sécurisé (ne supprime aucune donnée existante)
-- ========================================================

-- 1. Catégories : colonne system_key et index unique par utilisateur
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'system_key'
    ) THEN
        ALTER TABLE "categories" ADD COLUMN "system_key" TEXT;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "categories_user_id_system_key_key" 
ON "categories"("user_id", "system_key");

-- 2. Portefeuilles : colonne deleted_at (soft delete) et index
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wallets' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE "wallets" ADD COLUMN "deleted_at" TIMESTAMP(3);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "wallets_user_id_deleted_at_idx" 
ON "wallets"("user_id", "deleted_at");

-- 3. Transactions : linked_transfer_id, fee_percent et liaison de cascade
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'linked_transfer_id'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "linked_transfer_id" TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'fee_percent'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "fee_percent" DECIMAL(5, 2);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "transactions_linked_transfer_id_key" 
ON "transactions"("linked_transfer_id");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_linked_transfer_id_fkey'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_linked_transfer_id_fkey" 
        FOREIGN KEY ("linked_transfer_id") REFERENCES "transactions"("id") ON DELETE CASCADE;
    END IF;
END $$;
