import fs from 'fs';
import path from 'path';

// 1. Chargement garanti de .env.local AVANT tout import de Prisma
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
}

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[INFO] Mise à jour de la base PostgreSQL pour Portefeuilles (Wallets) & Dettes (Debts)...');

  // 1. Ajout de TRANSFER à l'enum TransactionType
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'TRANSFER';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `);

  // 2. Création de l'enum WalletType
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WalletType') THEN
        CREATE TYPE "WalletType" AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK', 'SAVINGS');
      END IF;
    END
    $$;
  `);

  // 3. Création de la table wallets
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "wallets" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "type" "WalletType" NOT NULL,
      "initial_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
      "color" TEXT NOT NULL DEFAULT '#2563EB',
      "is_default" BOOLEAN NOT NULL DEFAULT false,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
    );
  `);

  // 4. Index sur wallets
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "wallets_user_id_idx" ON "wallets"("user_id");
  `);

  // 5. Ajout des colonnes wallet_id et target_wallet_id à transactions si nécessaire
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'wallet_id'
      ) THEN
        ALTER TABLE "transactions" ADD COLUMN "wallet_id" TEXT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'target_wallet_id'
      ) THEN
        ALTER TABLE "transactions" ADD COLUMN "target_wallet_id" TEXT;
      END IF;
    END
    $$;
  `);

  // 6. Index sur transactions
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "transactions_wallet_id_idx" ON "transactions"("wallet_id");
  `);

  // 7. Enums & Table Debts
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DebtType') THEN
        CREATE TYPE "DebtType" AS ENUM ('LENT', 'BORROWED');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DebtStatus') THEN
        CREATE TYPE "DebtStatus" AS ENUM ('PENDING', 'PARTIAL', 'SETTLED');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "debts" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "person_name" TEXT NOT NULL,
      "type" "DebtType" NOT NULL,
      "initial_amount" DECIMAL(12,2) NOT NULL,
      "remaining_amount" DECIMAL(12,2) NOT NULL,
      "due_date" TIMESTAMP(3),
      "status" "DebtStatus" NOT NULL DEFAULT 'PENDING',
      "note" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "debts_user_id_status_idx" ON "debts"("user_id", "status");
  `);

  console.log('[SUCCESS] Tables wallets & debts et colonnes associées créées avec succès !');
}

main()
  .catch((e) => {
    console.error('[ERROR] Erreur création tables wallets / debts :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
