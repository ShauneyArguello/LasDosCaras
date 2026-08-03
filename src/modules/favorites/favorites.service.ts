import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

export async function addFavorite(userId: string, politicalViewId: string) {
  const view = await prisma.politicalView.findUnique({ where: { id: politicalViewId } });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }

  await prisma.favorite.upsert({
    where: { userId_politicalViewId: { userId, politicalViewId } },
    update: {},
    create: { userId, politicalViewId },
  });

  return { isFavorite: true };
}

export async function removeFavorite(userId: string, politicalViewId: string) {
  await prisma.favorite.deleteMany({ where: { userId, politicalViewId } });
  return { isFavorite: false };
}

export async function listFavoriteIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { politicalViewId: true },
    orderBy: { createdAt: 'desc' },
  });
  return favorites.map((f) => f.politicalViewId);
}
