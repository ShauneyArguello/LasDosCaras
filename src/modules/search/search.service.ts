import { prisma } from '../../lib/prisma';
import { normalizeHashtag } from '../../utils/hashtag';

export async function globalSearch(q: string) {
  const term = q.trim();
  if (!term) {
    return { views: [], categories: [], hashtags: [], authors: [] };
  }

  const [views, categories, hashtags, authors] = await Promise.all([
    prisma.politicalView.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { sides: { some: { title: { contains: term, mode: 'insensitive' } } } },
          { sides: { some: { description: { contains: term, mode: 'insensitive' } } } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
          { hashtags: { some: { name: { contains: normalizeHashtag(term), mode: 'insensitive' } } } },
        ],
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        sides: { select: { type: true, title: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { deletedAt: null, name: { contains: term, mode: 'insensitive' } },
      take: 10,
    }),
    prisma.hashtag.findMany({
      where: { name: { contains: normalizeHashtag(term), mode: 'insensitive' } },
      take: 10,
    }),
    prisma.user.findMany({
      where: { status: 'ACTIVE', name: { contains: term, mode: 'insensitive' } },
      select: { id: true, name: true },
      take: 10,
    }),
  ]);

  return { views, categories, hashtags, authors };
}
