import { PrismaClient } from "@prisma/client";

// === Deux clients Prisma distincts ===

// prismaUser — RLS activée, pour les Server Actions utilisateur
const globalForPrismaUser = globalThis as unknown as {
  prismaUser: PrismaClient | undefined;
};

export const prismaUser =
  globalForPrismaUser.prismaUser ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrismaUser.prismaUser = prismaUser;
}

// prismaService — Bypass RLS, pour les crons et webhooks système
const globalForPrismaService = globalThis as unknown as {
  prismaService: PrismaClient | undefined;
};

export const prismaService =
  globalForPrismaService.prismaService ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL_SERVICE,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrismaService.prismaService = prismaService;
}

// === Pattern RLS obligatoire ===

/**
 * Exécute une transaction avec RLS activée pour l'utilisateur donné.
 * SET request.jwt.sub = userId en début de transaction.
 *
 * @example
 * const parcours = await withRLS(userId, async (tx) => {
 *   return tx.parcours.findMany({ where: { user_id: userId } });
 * });
 */
export async function withRLS<T>(
  userId: string,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prismaUser.$transaction(async (tx) => {
    // Active RLS pour cet utilisateur dans cette transaction
    await tx.$executeRawUnsafe(
      `SET LOCAL request.jwt.sub = '${userId}'`
    );
    return callback(tx as unknown as PrismaClient);
  });
}
