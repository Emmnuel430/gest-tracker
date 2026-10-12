import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isPrismaUpToDate(client: any): boolean {
  return (
    Boolean(client) &&
    typeof client.transaction?.findMany === 'function' &&
    typeof client.budget?.findMany === 'function' &&
    typeof client.recurringRule?.findMany === 'function' &&
    typeof client.wallet?.findMany === 'function' &&
    typeof client.debt?.findMany === 'function'
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
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
