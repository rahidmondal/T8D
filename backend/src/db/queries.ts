import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function createUser(data: { email: string; passwordHash: string; name?: string }): Promise<User> {
  return prisma.user.create({ data });
}

export async function getAllUsers(): Promise<User[]> {
  return prisma.user.findMany();
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(
  id: string,
  data: Partial<{ email: string; passwordHash: string; name?: string }>,
): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({ where: { id } });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
