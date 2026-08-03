import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

export async function listCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
  });
}

export async function listAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.deletedAt) {
    throw ApiError.notFound('Category not found');
  }
  return category;
}

export async function createCategory(name: string) {
  return prisma.category.create({ data: { name } });
}

async function getActiveCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.deletedAt) {
    throw ApiError.notFound('Category not found');
  }
  return category;
}

export async function updateCategory(id: string, name: string) {
  await getActiveCategory(id);
  return prisma.category.update({ where: { id }, data: { name } });
}

export async function softDeleteCategory(id: string) {
  await getActiveCategory(id);
  return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
}
