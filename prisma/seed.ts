import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  'Economy',
  'Healthcare',
  'Education',
  'Immigration',
  'Environment',
  'Foreign Policy',
  'Civil Rights',
];

async function main() {
  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);

  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? 'Super Admin';

  if (email && password) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: { role: 'SUPERADMIN', status: 'ACTIVE' },
      create: { email, password: hashed, name, role: 'SUPERADMIN', status: 'ACTIVE' },
    });
    console.log(`Seeded superadmin user: ${email}`);
  } else {
    console.log('Skipped superadmin seed (SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set)');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
