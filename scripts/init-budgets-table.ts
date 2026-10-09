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
  console.log('📦 Création de la table budgets dans PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "budgets" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "amount" DECIMAL(12,2) NOT NULL,
      "month" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "budgets_user_id_category_month_key" 
    ON "budgets"("user_id", "category", "month");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "budgets_user_id_month_idx" 
    ON "budgets"("user_id", "month");
  `);

  console.log('✅ Table budgets et index créés avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur création table budgets :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
