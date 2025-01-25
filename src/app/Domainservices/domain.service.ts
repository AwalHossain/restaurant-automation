import { prisma } from "../../shared/prisma";

export class DomainService {
  async resolveTenantId(hostname: string): Promise<{ tenantId: string | null, restaurantId: string | null }> {
    // First check custom domains
    const customDomain = await prisma.domain.findFirst({
      where: {
        domain: hostname,
        isVerified: true,
        status: 'ACTIVE'
      },
      include: {
        restaurant: {
          select: {
            tenantId: true,
            id: true
          }
        }
      }
    });

    if (customDomain) {
      return {
        tenantId: customDomain.restaurant.tenantId,
        restaurantId: customDomain.restaurant.id
      };
    }

    // Then check application subdomains
    const subdomain = hostname.split('.')[0];
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        domain: subdomain
      },
      select: {
        tenantId: true,
        id: true
      }
    });

    return {
      tenantId: restaurant?.tenantId ?? null,
      restaurantId: restaurant?.id ?? null
    }
  }

  async generateSubdomain(restaurantName: string): Promise<string> {
    const baseSubdomain = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);

    let subdomain = baseSubdomain;
    let counter = 1;

    while (true) {
      const exists = await prisma.restaurant.findFirst({
        where: { domain: subdomain }
      });

      if (!exists) break;
      subdomain = `${baseSubdomain}${counter}`;
      counter++;
    }

    return subdomain;
  }

  async addCustomDomain(restaurantId: string, customDomain: string) {
    const dnsRecord = this.generateDNSRecord();
    
    return await prisma.domain.create({
      data: {
        domain: customDomain,
        isCustom: true,
        dnsRecord,
        restaurantId
      }
    });
  }

  private generateDNSRecord(): string {
    return `verify-domain=${crypto.randomUUID().toString()}`;
  }
} 