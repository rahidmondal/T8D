import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Prisma test...');

  const newUser = await prisma.user.create({
    data: {
      email: `test${Date.now()}@example.com`,
      passwordHash: 'hashedpassword123',
      name: 'Test User',
    },
  });
  console.log('Created User:', newUser);

  const allUsers = await prisma.user.findMany();
  console.log('All Users:', allUsers);

  const singleUser = await prisma.user.findUnique({
    where: { id: newUser.id },
  });
  console.log('Found User by ID:', singleUser);

  const updatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { name: 'Updated Test User' },
  });
  console.log('Updated User:', updatedUser);

  const deletedUser = await prisma.user.delete({
    where: { id: newUser.id },
  });
  console.log('Deleted User:', deletedUser);

  console.log('✅ All CRUD operations completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.error('Error during Prisma test:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
