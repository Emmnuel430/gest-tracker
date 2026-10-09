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
  console.log('🔍 Recherche des utilisateurs existants dans Supabase auth.users...');
  console.log(`🔌 Connexion DB: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  // Requête directe PostgreSQL dans le schéma auth
  const users = await prisma.$queryRaw<Array<{ id: string; email: string; created_at: Date }>>`
    SELECT id, email, created_at FROM auth.users ORDER BY created_at ASC;
  `;

  if (!users || users.length === 0) {
    console.error('❌ Aucun utilisateur trouvé dans la table auth.users de Supabase !');
    process.exit(1);
  }

  console.log(`👤 Utilisateur(s) trouvé(s) (${users.length}) :`);
  users.forEach((u, i) => console.log(`   [${i + 1}] Email: ${u.email} | ID: ${u.id}`));

  const targetUser = users[0];
  console.log(`\n🎯 Compte sélectionné pour le rattachement : ${targetUser.email} (${targetUser.id})`);

  // Compter les transactions orphelines (userId IS NULL)
  const orphanCount = await prisma.transaction.count({
    where: { userId: null },
  });

  const totalCount = await prisma.transaction.count();

  console.log(`\n📊 Statistiques actuelles :`);
  console.log(`   - Total des transactions en base : ${totalCount}`);
  console.log(`   - Transactions orphelines (sans userId) : ${orphanCount}`);

  if (orphanCount === 0) {
    console.log('✨ Aucune transaction orpheline à migrer ! Toutes les transactions ont déjà un userId.');
    return;
  }

  // Mise à jour de toutes les transactions orphelines
  const updateResult = await prisma.transaction.updateMany({
    where: { userId: null },
    data: { userId: targetUser.id },
  });

  console.log(`\n✅ SUCCÈS : ${updateResult.count} transaction(s) rattachée(s) avec succès à ${targetUser.email} !`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du backfill :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
