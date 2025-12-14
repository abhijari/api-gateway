import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create a test API key
  const key = `ak_${crypto.randomBytes(32).toString('hex')}`;
  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      key,
      limitPerMinute: 60,
      limitPerDay: 10000,
    },
  });

  console.log('✅ Created API key:', apiKey.key);
  console.log('\n📝 You can use this API key for testing:');
  console.log(apiKey.key);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

