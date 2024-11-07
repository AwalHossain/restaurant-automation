import { PrismaClient } from '@prisma/client';

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }

    return PrismaService.instance;
  }
}

// Export a singleton instance
export const prisma = PrismaService.getInstance();

// Handle cleanup on app termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
