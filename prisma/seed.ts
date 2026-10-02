import { PrismaClient, TransactionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { subDays, subMonths } from 'date-fns';
import fs from 'fs';

// Chargement garanti de .env.local
if (!process.env.DATABASE_URL && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du seed des transactions...');

  // Nettoyage préalable des transactions existantes dans la base de test
  await prisma.transaction.deleteMany();

  const now = new Date();

  const transactionsData = [
    // --- REVENUS MOIS EN COURS ---
    {
      type: TransactionType.INCOME,
      amount: 350000,
      category: 'Travail PC',
      payment: 'Compte bancaire',
      note: 'Salaire virement mensuel',
      date: subDays(now, 2),
    },
    {
      type: TransactionType.INCOME,
      amount: 75000,
      category: 'Freelance',
      payment: 'Wave',
      note: 'Refonte landing page client',
      date: subDays(now, 5),
    },
    {
      type: TransactionType.INCOME,
      amount: 40000,
      category: 'Cours en ligne',
      payment: 'Orange Money',
      note: 'Vente formation Next.js',
      date: subDays(now, 10),
    },
    {
      type: TransactionType.INCOME,
      amount: 25000,
      category: 'Don',
      payment: 'Wave',
      note: 'Cadeau anniversaire',
      date: subDays(now, 12),
    },

    // --- DÉPENSES CETTE SEMAINE / AUJOURD'HUI ---
    {
      type: TransactionType.EXPENSE,
      amount: 5000,
      category: 'Alimentation',
      payment: 'Wave',
      note: 'Déjeuner restaurant',
      date: now,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 2500,
      category: 'Transport',
      payment: 'Orange Money',
      note: 'Course Yango / Taxi',
      date: subDays(now, 1),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 12000,
      category: 'Alimentation',
      payment: 'Wave',
      note: 'Courses supermarché',
      date: subDays(now, 2),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15000,
      category: 'Kajai',
      payment: 'Wave',
      note: 'Participation tontine / projet',
      date: subDays(now, 3),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 3500,
      category: 'Transport',
      payment: 'Espèces',
      note: 'Carburant moto',
      date: subDays(now, 4),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 8000,
      category: 'Abonnement',
      payment: 'Carte bancaire',
      note: 'Abonnement Internet fibre',
      date: subDays(now, 6),
    },

    // --- DÉPENSES MOIS EN COURS (Jours 7 à 25) ---
    {
      type: TransactionType.EXPENSE,
      amount: 70000,
      category: 'Logement',
      payment: 'Compte bancaire',
      note: 'Loyer mensuel',
      date: subDays(now, 8),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 25000,
      category: 'Famille',
      payment: 'Wave',
      note: 'Aide famille au pays',
      date: subDays(now, 9),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 6000,
      category: 'Santé',
      payment: 'Orange Money',
      note: 'Pharmacie médicaments',
      date: subDays(now, 11),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 18000,
      category: 'Alimentation',
      payment: 'Espèces',
      note: 'Marché vivrier semaine',
      date: subDays(now, 13),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 4500,
      category: 'Loisirs',
      payment: 'Wave',
      note: 'Sortie cinéma et boisson',
      date: subDays(now, 14),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 10000,
      category: 'Personnel',
      payment: 'Espèces',
      note: 'Coiffeur & soins',
      date: subDays(now, 16),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15000,
      category: 'Éducation',
      payment: 'Carte bancaire',
      note: 'Livre technique TypeScript',
      date: subDays(now, 18),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 7000,
      category: 'Transport',
      payment: 'Orange Money',
      note: 'Recharge carte transport',
      date: subDays(now, 20),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 9500,
      category: 'Alimentation',
      payment: 'Wave',
      note: 'Dîner entre amis',
      date: subDays(now, 22),
    },

    // --- TRANSACTIONS MOIS PRÉCÉDENT (Pour tester les comparaisons N vs N-1) ---
    {
      type: TransactionType.INCOME,
      amount: 320000,
      category: 'Travail PC',
      payment: 'Compte bancaire',
      note: 'Salaire mois M-1',
      date: subMonths(subDays(now, 3), 1),
    },
    {
      type: TransactionType.INCOME,
      amount: 50000,
      category: 'Freelance',
      payment: 'Wave',
      note: 'Mission conseil M-1',
      date: subMonths(subDays(now, 15), 1),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 70000,
      category: 'Logement',
      payment: 'Compte bancaire',
      note: 'Loyer M-1',
      date: subMonths(subDays(now, 5), 1),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 45000,
      category: 'Alimentation',
      payment: 'Wave',
      note: 'Total alimentation M-1',
      date: subMonths(subDays(now, 10), 1),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 20000,
      category: 'Famille',
      payment: 'Wave',
      note: 'Envoi M-1',
      date: subMonths(subDays(now, 14), 1),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15000,
      category: 'Transport',
      payment: 'Orange Money',
      note: 'Déplacements M-1',
      date: subMonths(subDays(now, 18), 1),
    },
    {
      type: TransactionType.EXPENSE,
      amount: 10000,
      category: 'Kajai',
      payment: 'Wave',
      note: 'Cotisation M-1',
      date: subMonths(subDays(now, 21), 1),
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({
      data: tx,
    });
  }

  console.log(`✅ Seed terminé avec succès ! ${transactionsData.length} transactions insérées.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
