import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

function isPrismaUpToDate(client: any): boolean {
  return (
    client &&
    typeof client.transaction?.findMany === 'function' &&
    typeof client.budget?.findMany === 'function' &&
    typeof client.recurringRule?.findMany === 'function' &&
    typeof client.wallet?.findMany === 'function' &&
    typeof client.debt?.findMany === 'function'
  );
}

export const prisma = (() => {
  if (globalForPrisma.prisma && isPrismaUpToDate(globalForPrisma.prisma)) {
    return globalForPrisma.prisma;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
})();

export default prisma;


