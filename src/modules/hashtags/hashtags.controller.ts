import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { prisma } from '../../lib/prisma';
import { normalizeHashtag } from '../../utils/hashtag';

export const listHashtags = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query.q as string | undefined;
  const hashtags = await prisma.hashtag.findMany({
    where: q ? { name: { contains: normalizeHashtag(q), mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
    take: 20,
  });
  res.json({ hashtags });
});
