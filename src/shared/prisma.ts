import { PrismaClient } from '@prisma/client';

async function excludePasswordMiddleware(params: any, next: any) {
  const result = await next(params);
  
  if (params?.model === 'User') {
    if (Array.isArray(result)) {
      result.forEach(item => delete item.password);
    } else if (result && typeof result === 'object') {
      delete result.password;
    }
  }
  return result;
}

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      
      // Add middleware for password exclusion
      // PrismaService.instance.$use(excludePasswordMiddleware);
    }

    return PrismaService.instance;
  }
}

export const prisma = PrismaService.getInstance();

// Cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});