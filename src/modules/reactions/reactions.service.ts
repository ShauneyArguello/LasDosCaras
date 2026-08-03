import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

const SIDE_TYPE: Record<'a' | 'b', 'SIDE' | 'COUNTERPART'> = { a: 'SIDE', b: 'COUNTERPART' };

async function resolveViewSide(politicalViewId: string, side: 'a' | 'b') {
  const viewSide = await prisma.viewSide.findUnique({
    where: { politicalViewId_type: { politicalViewId, type: SIDE_TYPE[side] } },
  });
  if (!viewSide) {
    throw ApiError.notFound('Political view not found');
  }
  return viewSide;
}

async function getCounts(viewSideId: string, mine: { type: 'LIKE' | 'DISLIKE' } | null) {
  const counts = await prisma.reaction.groupBy({
    by: ['type'],
    where: { viewSideId },
    _count: { _all: true },
  });

  const likeCount = counts.find((c) => c.type === 'LIKE')?._count._all ?? 0;
  const dislikeCount = counts.find((c) => c.type === 'DISLIKE')?._count._all ?? 0;

  return { likeCount, dislikeCount, myReaction: mine?.type ?? null };
}

export async function setSideReaction(
  userId: string,
  politicalViewId: string,
  side: 'a' | 'b',
  type: 'LIKE' | 'DISLIKE',
) {
  const viewSide = await resolveViewSide(politicalViewId, side);

  const reaction = await prisma.reaction.upsert({
    where: { userId_viewSideId: { userId, viewSideId: viewSide.id } },
    update: { type },
    create: { userId, viewSideId: viewSide.id, type },
  });

  return getCounts(viewSide.id, reaction);
}
