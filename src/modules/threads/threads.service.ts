import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

const commentInclude = {
  user: { select: { id: true, name: true } },
  replies: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export async function createThread(
  politicalViewId: string,
  userId: string,
  input: { title?: string; content: string },
) {
  const view = await prisma.politicalView.findUnique({ where: { id: politicalViewId } });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }

  return prisma.commentThread.create({
    data: {
      politicalViewId,
      title: input.title,
      comments: {
        create: { userId, content: input.content },
      },
    },
    include: {
      comments: { include: commentInclude },
    },
  });
}

export async function listThreads(politicalViewId: string) {
  const view = await prisma.politicalView.findUnique({ where: { id: politicalViewId } });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }

  return prisma.commentThread.findMany({
    where: { politicalViewId },
    orderBy: { createdAt: 'asc' },
    include: {
      comments: {
        where: { parentId: null },
        include: commentInclude,
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}
