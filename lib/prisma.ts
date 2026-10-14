import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isPrismaUpToDate(client: unknown): boolean {
  if (!client || typeof client !== 'object') return false;
  const c = client as Record<string, unknown>;
  return (
    typeof (c.transaction as Record<string, unknown> | undefined)?.findMany === 'function' &&
    typeof (c.budget as Record<string, unknown> | undefined)?.findMany === 'function' &&
    typeof (c.recurringRule as Record<string, unknown> | undefined)?.findMany === 'function' &&
    typeof (c.wallet as Record<string, unknown> | undefined)?.findMany === 'function' &&
    typeof (c.debt as Record<string, unknown> | undefined)?.findMany === 'function' &&
    typeof (c.category as Record<string, unknown> | undefined)?.findMany === 'function' &&
    typeof (c.recurringReminderLog as Record<string, unknown> | undefined)?.findMany === 'function'
  );
}

function resolvePrismaClientClass(): typeof PrismaClient {
  // En environnement Node (serveur Next.js dev), si le client chargé est obsolète,
  // on purge require.cache pour recharger les définitions générées sur le disque
  if (typeof require !== 'undefined' && require.cache) {
    try {
      const keysToPurge = Object.keys(require.cache).filter(
        (key) => key.includes('prisma') || key.includes('@prisma')
      );
      for (const key of keysToPurge) {
        delete require.cache[key];
      }
      const reloaded = require('@prisma/client');
      if (reloaded?.PrismaClient) {
        return reloaded.PrismaClient;
      }
    } catch {
      // Utilisation du PrismaClient statique par défaut
    }
  }
  return PrismaClient;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  const ClientClass = resolvePrismaClientClass();

  return new ClientClass({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

function getOrInitPrisma(): PrismaClient {
  if (globalForPrisma.prisma && isPrismaUpToDate(globalForPrisma.prisma)) {
    return globalForPrisma.prisma;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

/**
 * Singleton Prisma dynamique sous forme de Proxy
 * Garantit l'auto-guérison si les modèles sont re-générés à chaud
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrInitPrisma();
    const value = Reflect.get(client, prop);
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

export default prisma;
