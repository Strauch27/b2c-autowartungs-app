import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...');

  // Customer: kunde@kunde.de / kunde
  const kundeHash = await bcrypt.hash('kunde', 10);
  await prisma.user.upsert({
    where: { email: 'kunde@kunde.de' },
    update: {
      passwordHash: kundeHash,
    },
    create: {
      email: 'kunde@kunde.de',
      firstName: 'Test',
      lastName: 'Kunde',
      role: 'CUSTOMER',
      passwordHash: kundeHash,
    },
  });
  console.log('✅ Customer: kunde@kunde.de / kunde');

  // Jockey: jockey@jockey.de / jockey
  const jockeyHash = await bcrypt.hash('jockey', 10);
  await prisma.user.upsert({
    where: { email: 'jockey@jockey.de' },
    update: {
      passwordHash: jockeyHash,
      username: 'jockey',
    },
    create: {
      email: 'jockey@jockey.de',
      firstName: 'Test',
      lastName: 'Jockey',
      username: 'jockey',
      role: 'JOCKEY',
      passwordHash: jockeyHash,
    },
  });
  console.log('✅ Jockey: jockey@jockey.de / jockey');

  // Workshop: werkstatt@werkstatt.de / werkstatt
  const werkstattHash = await bcrypt.hash('werkstatt', 10);
  await prisma.user.upsert({
    where: { email: 'werkstatt@werkstatt.de' },
    update: {
      passwordHash: werkstattHash,
      username: 'werkstatt',
    },
    create: {
      email: 'werkstatt@werkstatt.de',
      firstName: 'Test',
      lastName: 'Werkstatt',
      username: 'werkstatt',
      role: 'WORKSHOP',
      passwordHash: werkstattHash,
    },
  });
  console.log('✅ Workshop: werkstatt@werkstatt.de / werkstatt');

  console.log('\n🎉 Test users created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
