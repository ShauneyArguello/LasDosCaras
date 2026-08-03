import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';

export async function getAuthorById(id: string) {
  const author = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, createdAt: true },
  });
  if (!author) {
    throw ApiError.notFound('Author not found');
  }

  const publishedViewsCount = await prisma.politicalView.count({
    where: { authorId: id, status: 'PUBLISHED' },
  });

  return { ...author, publishedViewsCount };
}
