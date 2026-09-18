import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Disable query logging in production for performance and to avoid noise.
const enableLogs = process.env.NODE_ENV !== 'production'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(
    enableLogs
      ? { log: ['query', 'warn', 'error'] }
      : { log: ['error'] }
  )

// In production, disconnect after 5s of idle to avoid hanging connections
if (process.env.NODE_ENV === 'production') {
  // Configure connection pool limits for Hostinger MySQL
  try {
    (db as any).$on?.('query', () => {})
  } catch {
    // ignore
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
