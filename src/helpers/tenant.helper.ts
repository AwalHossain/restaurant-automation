import crypto from 'crypto';
import { prisma } from "../shared/prisma";

export class TenantHelper {
  static async generateTenantId(domainName: string): Promise<string> {
    // Create a base tenant ID from company name
    let baseTenantId = domainName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .slice(0, 8); // Take first 8 characters

    // Add a random suffix
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    let tenantId = `${baseTenantId}-${randomSuffix}`;

    // Check if tenant ID already exists
    let exists = await prisma.user.findFirst({
      where: { tenantId }
    });

    // If exists, generate a new one
    while (exists) {
      const newSuffix = crypto.randomBytes(4).toString('hex');
      tenantId = `${baseTenantId}-${newSuffix}`;
      exists = await prisma.user.findFirst({
        where: { tenantId }
      });
    }

    return tenantId;
  }

  static async getTenantId(domainName: string): Promise<string> {
    const tenantId = await this.generateTenantId(domainName);
    return tenantId;
  }
}