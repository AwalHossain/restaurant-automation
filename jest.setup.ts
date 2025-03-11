import { prisma } from './src/shared/prisma';

beforeAll(async () => {
  // Connect to test database
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/restaurant_testpostgres://koyeb-adm:npg_eBg1RQ9ODFyE@ep-long-meadow-a1awnbil.ap-southeast-1.pg.koyeb.app/koyebdb';
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up test data after each test
  const tables = ['Restaurant', 'Branch', 'RestaurantStaff', 'Permission', 'Role'];
  await Promise.all(
    tables.map(table => 
      prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
    )
  );
}); 