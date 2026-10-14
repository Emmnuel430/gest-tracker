-- Migration v2.3.0 : Portefeuilles comme source des moyens de paiement
-- Patron Expand/Contract : ajout de is_archived sur wallets, wallet_id sur recurring_rules et backfill complet

-- 1. Colonne is_archived sur la table wallets
ALTER TABLE "wallets"
ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "idx_wallets_user_is_archived"
ON "wallets" ("user_id", "is_archived");

-- 2. Clé étrangère wallet_id sur recurring_rules (type TEXT pour correspondre à wallets.id)
DO $$
BEGIN
  -- Si wallet_id a été créé en UUID par erreur, le convertir en TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recurring_rules' AND column_name = 'wallet_id' AND data_type != 'text'
  ) THEN
    ALTER TABLE "recurring_rules" ALTER COLUMN "wallet_id" TYPE TEXT;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recurring_rules' AND column_name = 'wallet_id'
  ) THEN
    ALTER TABLE "recurring_rules" ADD COLUMN "wallet_id" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'recurring_rules_wallet_id_fkey'
  ) THEN
    ALTER TABLE "recurring_rules"
    ADD CONSTRAINT "recurring_rules_wallet_id_fkey"
    FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_recurring_rules_wallet_id"
ON "recurring_rules" ("wallet_id");

CREATE INDEX IF NOT EXISTS "idx_recurring_rules_user_wallet"
ON "recurring_rules" ("user_id", "wallet_id");

-- 3. Backfill des portefeuilles et réconciliation des moyens de paiement existants
DO $$
DECLARE
  u RECORD;
  p_row RECORD;
  v_target_wallet_id TEXT;
  v_inferred_type "WalletType";
  v_inferred_color TEXT;
  v_clean_payment TEXT;
BEGIN
  -- Boucle sur tous les utilisateurs distincts ayant des transactions ou des règles récurrentes
  FOR u IN (
    SELECT DISTINCT user_id FROM "transactions" WHERE user_id IS NOT NULL
    UNION
    SELECT DISTINCT user_id FROM "recurring_rules" WHERE user_id IS NOT NULL
    UNION
    SELECT DISTINCT user_id FROM "wallets" WHERE user_id IS NOT NULL
  ) LOOP

    -- Si l'utilisateur n'a aucun portefeuille, lui créer au minimum "Espèces"
    IF NOT EXISTS (SELECT 1 FROM "wallets" WHERE user_id = u.user_id) THEN
      INSERT INTO "wallets" ("id", "user_id", "name", "type", "initial_balance", "color", "is_default", "is_archived", "created_at", "updated_at")
      VALUES (gen_random_uuid()::text, u.user_id, 'Espèces', 'CASH', 0, '#00DF81', true, false, NOW(), NOW());
    END IF;

    -- Lister tous les paiements textuels distincts utilisés par cet utilisateur
    FOR p_row IN (
      SELECT DISTINCT TRIM(payment) AS payment
      FROM "transactions"
      WHERE user_id = u.user_id AND payment IS NOT NULL AND TRIM(payment) != '' AND type != 'TRANSFER'
      UNION
      SELECT DISTINCT TRIM(payment) AS payment
      FROM "recurring_rules"
      WHERE user_id = u.user_id AND payment IS NOT NULL AND TRIM(payment) != ''
    ) LOOP
      v_clean_payment := p_row.payment;

      -- Chercher si un portefeuille porte déjà ce nom (insensible à la casse)
      SELECT id INTO v_target_wallet_id
      FROM "wallets"
      WHERE user_id = u.user_id AND LOWER(TRIM(name)) = LOWER(v_clean_payment)
      LIMIT 1;

      -- S'il n'existe pas, créer le portefeuille adapté
      IF v_target_wallet_id IS NULL THEN
        -- Déduction du type
        IF LOWER(v_clean_payment) LIKE '%wave%' OR LOWER(v_clean_payment) LIKE '%orange%' OR LOWER(v_clean_payment) LIKE '%mtn%' OR LOWER(v_clean_payment) LIKE '%moov%' OR LOWER(v_clean_payment) LIKE '%mobile%' THEN
          v_inferred_type := 'MOBILE_MONEY';
        ELSIF LOWER(v_clean_payment) LIKE '%banque%' OR LOWER(v_clean_payment) LIKE '%compte%' OR LOWER(v_clean_payment) LIKE '%carte%' OR LOWER(v_clean_payment) LIKE '%virement%' THEN
          v_inferred_type := 'BANK';
        ELSIF LOWER(v_clean_payment) LIKE '%epargne%' OR LOWER(v_clean_payment) LIKE '%épargne%' OR LOWER(v_clean_payment) LIKE '%coffre%' THEN
          v_inferred_type := 'SAVINGS';
        ELSE
          v_inferred_type := 'CASH';
        END IF;

        -- Déduction de la couleur
        IF LOWER(v_clean_payment) LIKE '%wave%' THEN
          v_inferred_color := '#1E90FF';
        ELSIF LOWER(v_clean_payment) LIKE '%orange%' THEN
          v_inferred_color := '#FF7900';
        ELSIF LOWER(v_clean_payment) LIKE '%banque%' OR LOWER(v_clean_payment) LIKE '%compte%' THEN
          v_inferred_color := '#6B7280';
        ELSIF LOWER(v_clean_payment) LIKE '%carte%' THEN
          v_inferred_color := '#3B82F6';
        ELSIF LOWER(v_clean_payment) LIKE '%espèce%' OR LOWER(v_clean_payment) LIKE '%espece%' OR LOWER(v_clean_payment) LIKE '%cash%' THEN
          v_inferred_color := '#00DF81';
        ELSE
          v_inferred_color := '#2563EB';
        END IF;

        v_target_wallet_id := gen_random_uuid()::text;
        INSERT INTO "wallets" (
          "id", "user_id", "name", "type", "initial_balance", "color", "is_default", "is_archived", "created_at", "updated_at"
        ) VALUES (
          v_target_wallet_id, u.user_id, v_clean_payment, v_inferred_type, 0, v_inferred_color, false, false, NOW(), NOW()
        );
      END IF;

      -- Lier les transactions sans portefeuille
      UPDATE "transactions"
      SET "wallet_id" = v_target_wallet_id
      WHERE user_id = u.user_id
        AND (wallet_id IS NULL)
        AND type != 'TRANSFER'
        AND LOWER(TRIM(payment)) = LOWER(v_clean_payment);

      -- Lier les règles récurrentes sans portefeuille
      UPDATE "recurring_rules"
      SET "wallet_id" = v_target_wallet_id
      WHERE user_id = u.user_id
        AND (wallet_id IS NULL)
        AND LOWER(TRIM(payment)) = LOWER(v_clean_payment);

    END LOOP;

    -- Rattrapage de secours : si des transactions ou récurrences restent orphelines, les rattacher au portefeuille par défaut ou premier portefeuille
    SELECT id INTO v_target_wallet_id
    FROM "wallets"
    WHERE user_id = u.user_id
    ORDER BY is_default DESC, created_at ASC
    LIMIT 1;

    IF v_target_wallet_id IS NOT NULL THEN
      UPDATE "transactions"
      SET "wallet_id" = v_target_wallet_id
      WHERE user_id = u.user_id AND wallet_id IS NULL AND type != 'TRANSFER';

      UPDATE "recurring_rules"
      SET "wallet_id" = v_target_wallet_id
      WHERE user_id = u.user_id AND wallet_id IS NULL;
    END IF;

  END LOOP;
END $$;
