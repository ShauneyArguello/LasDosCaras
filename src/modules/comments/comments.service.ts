import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

const commentInclude = {
  user: { select: { id: true, name: true } },
  replies: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export async function createComment(
  threadId: string,
  userId: string,
  input: { content: string; parentId?: string },
) {
  const thread = await prisma.commentThread.findUnique({ where: { id: threadId } });
  if (!thread) {
    throw ApiError.notFound('Comment thread not found');
  }

  if (input.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: input.parentId } });
    if (!parent || parent.threadId !== threadId) {
      throw ApiError.badRequest('parentId must reference a comment in the same thread');
    }
  }

  return prisma.comment.create({
    data: {
      threadId,
      userId,
      content: input.content,
      parentId: input.parentId,
    },
    include: commentInclude,
  });
}

export async function listComments(threadId: string) {
  const thread = await prisma.commentThread.findUnique({ where: { id: threadId } });
  if (!thread) {
    throw ApiError.notFound('Comment thread not found');
  }

  return prisma.comment.findMany({
    where: { threadId, parentId: null },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });
}
