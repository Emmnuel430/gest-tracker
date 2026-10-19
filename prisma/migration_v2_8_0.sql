-- ========================================================
-- SCRIPT DE MIGRATION V2.8.0 POUR SUPABASE (PRODUCTION)
-- GEST TRACKER — Solde actuel déclaré (Référence T0)
-- Ce script est idempotent et sécurisé (ne supprime aucune donnée existante)
-- ========================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wallets' AND column_name = 'declared_balance'
    ) THEN
        ALTER TABLE "wallets" ADD COLUMN "declared_balance" DECIMAL(12, 2);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wallets' AND column_name = 'declared_at'
    ) THEN
        ALTER TABLE "wallets" ADD COLUMN "declared_at" TIMESTAMP(3);
    END IF;
END $$;
