import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: typeof PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch {
    console.warn("PrismaClient not available. Run `npx prisma generate` first.");
    return null as unknown as InstanceType<typeof PrismaClient>;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
