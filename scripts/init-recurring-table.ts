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
  console.log('📦 Création de la table recurring_rules dans PostgreSQL...');

  // 1. Création de l'enum RecurrenceFrequency si non existant
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RecurrenceFrequency') THEN
        CREATE TYPE "RecurrenceFrequency" AS ENUM ('MONTHLY', 'WEEKLY', 'YEARLY');
      END IF;
    END
    $$;
  `);

  // 2. Création de la table recurring_rules
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "recurring_rules" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "type" "TransactionType" NOT NULL,
      "amount" DECIMAL(12,2) NOT NULL,
      "category" TEXT NOT NULL,
      "payment" TEXT NOT NULL,
      "day_of_month" INTEGER NOT NULL,
      "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY',
      "note" TEXT,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "last_processed_month" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "recurring_rules_pkey" PRIMARY KEY ("id")
    );
  `);

  // 3. Index
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "recurring_rules_user_id_is_active_idx" 
    ON "recurring_rules"("user_id", "is_active");
  `);

  console.log('✅ Table recurring_rules et index créés avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur création table recurring_rules :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
