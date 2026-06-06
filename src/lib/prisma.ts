import { PrismaClient } from "@prisma/client";

/**
 * Singleton del PrismaClient.
 *
 * En desarrollo Next.js hace HMR y cada hot-reload crearía un cliente nuevo,
 * agotando el pool de conexiones de Postgres. Guardamos la instancia en
 * globalThis para reutilizarla entre reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
