import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateCheckoutItems() {
  // Get all existing checkouts
  const checkouts = await prisma.checkout.findMany({
    include: {
      // Include any existing relations you need
      user: true,
      branch: true,
      address: true,
      userPoints: true,
    }
  });

  console.log(`Found ${checkouts.length} existing checkouts`);

  for (const checkout of checkouts) {
    // You might want to add a note in the checkout to indicate it's a legacy entry
    await prisma.checkout.update({
      where: { id: checkout.id },
      data: {
        notes: checkout.notes 
          ? `${checkout.notes} (Legacy checkout - items may be incomplete)`
          : 'Legacy checkout - items may be incomplete'
      }
    });
  }

  console.log('Migration completed successfully');
}

populateCheckoutItems()
  .catch((e) => {
    console.error('Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });