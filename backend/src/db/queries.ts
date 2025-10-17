import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Queries will be written here

  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
