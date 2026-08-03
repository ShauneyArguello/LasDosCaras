import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
};

export interface ListUsersInput {
  search?: string;
  page: number;
  limit: number;
}

export async function listUsers(input: ListUsersInput) {
  const where = input.search
    ? {
        OR: [
          { name: { contains: input.search, mode: 'insensitive' as const } },
          { email: { contains: input.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
  ]);

  return { total, page: input.page, limit: input.limit, users };
}

async function getExistingUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

export async function banUser(id: string) {
  await getExistingUser(id);
  return prisma.user.update({ where: { id }, data: { status: 'SUSPENDED' }, select: userSelect });
}

export async function unbanUser(id: string) {
  await getExistingUser(id);
  return prisma.user.update({ where: { id }, data: { status: 'ACTIVE' }, select: userSelect });
}
