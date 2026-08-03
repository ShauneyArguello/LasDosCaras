import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { normalizeHashtag } from '../../utils/hashtag';

interface SourceInput {
  type: 'LINK' | 'YOUTUBE' | 'DOCUMENT';
  url: string;
  label?: string;
}

interface SideInput {
  title: string;
  description: string;
  sources: SourceInput[];
}

export interface CreateViewInput {
  categoryId: string;
  side: SideInput;
  counterpart: SideInput;
  hashtags?: string[];
}

export type UpdateViewInput = CreateViewInput;

export interface ListViewsInput {
  category?: string;
  hashtag?: string;
  sort: 'likes' | 'dislikes' | 'recent';
  page: number;
  limit: number;
  autorId?: string;
  autor?: 'me';
}

export interface ListAdminViewsInput {
  status?: 'PUBLISHED' | 'UNPUBLISHED';
  page: number;
  limit: number;
}

interface Requester {
  id: string;
  role: string;
}

const viewInclude = {
  category: true,
  author: { select: { id: true, name: true } },
  sides: { include: { sources: true } },
  hashtags: { select: { id: true, name: true } },
  _count: { select: { threads: true } },
};

async function resolveHashtags(names: string[] = []) {
  const normalized = Array.from(new Set(names.map(normalizeHashtag).filter(Boolean)));
  if (normalized.length === 0) {
    return [];
  }
  return Promise.all(
    normalized.map((name) => prisma.hashtag.upsert({ where: { name }, update: {}, create: { name } })),
  );
}

async function attachExtras<
  T extends { id: string; sides: { id: string; type: string }[] },
>(views: T[], userId?: string) {
  if (views.length === 0) {
    return [];
  }

  const sideIds = views.flatMap((v) => v.sides.map((s) => s.id));
  const viewIds = views.map((v) => v.id);

  const [counts, myReactions, myFavorites] = await Promise.all([
    prisma.reaction.groupBy({ by: ['viewSideId', 'type'], where: { viewSideId: { in: sideIds } }, _count: { _all: true } }),
    userId
      ? prisma.reaction.findMany({ where: { userId, viewSideId: { in: sideIds } } })
      : Promise.resolve([]),
    userId
      ? prisma.favorite.findMany({ where: { userId, politicalViewId: { in: viewIds } } })
      : Promise.resolve([]),
  ]);

  const countMap = new Map<string, { likeCount: number; dislikeCount: number }>();
  for (const c of counts) {
    const entry = countMap.get(c.viewSideId) ?? { likeCount: 0, dislikeCount: 0 };
    if (c.type === 'LIKE') entry.likeCount = c._count._all;
    if (c.type === 'DISLIKE') entry.dislikeCount = c._count._all;
    countMap.set(c.viewSideId, entry);
  }
  const myReactionMap = new Map(myReactions.map((r) => [r.viewSideId, r.type]));
  const favoriteSet = new Set(myFavorites.map((f) => f.politicalViewId));

  return views.map((v) => {
    const sides = v.sides.map((s) => {
      const c = countMap.get(s.id) ?? { likeCount: 0, dislikeCount: 0 };
      return { ...s, likeCount: c.likeCount, dislikeCount: c.dislikeCount, myReaction: myReactionMap.get(s.id) ?? null };
    });
    const totalLikes = sides.reduce((sum, s) => sum + s.likeCount, 0);
    const totalDislikes = sides.reduce((sum, s) => sum + s.dislikeCount, 0);
    return { ...v, sides, totalLikes, totalDislikes, isFavorite: favoriteSet.has(v.id) };
  });
}

async function getActiveCategory(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.deletedAt) {
    throw ApiError.badRequest('Category does not exist');
  }
  return category;
}

export async function createView(authorId: string, input: CreateViewInput) {
  await getActiveCategory(input.categoryId);
  const hashtags = await resolveHashtags(input.hashtags);

  const view = await prisma.politicalView.create({
    data: {
      categoryId: input.categoryId,
      authorId,
      sides: {
        create: [
          { type: 'SIDE', title: input.side.title, description: input.side.description, sources: { create: input.side.sources } },
          { type: 'COUNTERPART', title: input.counterpart.title, description: input.counterpart.description, sources: { create: input.counterpart.sources } },
        ],
      },
      ...(hashtags.length > 0 ? { hashtags: { connect: hashtags.map((h) => ({ id: h.id })) } } : {}),
    },
    include: viewInclude,
  });

  const [withExtras] = await attachExtras([view], authorId);
  return withExtras;
}

export async function listViews(input: ListViewsInput, requesterId?: string) {
  let authorFilter: string | undefined;
  if (input.autor === 'me') {
    if (!requesterId) {
      throw ApiError.unauthorized('Authentication required to filter by autor=me');
    }
    authorFilter = requesterId;
  } else if (input.autorId) {
    authorFilter = input.autorId;
  }

  const where = {
    status: 'PUBLISHED' as const,
    ...(input.category ? { categoryId: input.category } : {}),
    ...(input.hashtag ? { hashtags: { some: { name: normalizeHashtag(input.hashtag) } } } : {}),
    ...(authorFilter ? { authorId: authorFilter } : {}),
  };

  if (input.sort === 'recent') {
    const [total, views] = await Promise.all([
      prisma.politicalView.count({ where }),
      prisma.politicalView.findMany({
        where,
        include: viewInclude,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
    ]);
    const withExtras = await attachExtras(views, requesterId);
    return { total, page: input.page, limit: input.limit, views: withExtras };
  }

  const allViews = await prisma.politicalView.findMany({ where, include: viewInclude, orderBy: { createdAt: 'desc' } });
  const withExtras = await attachExtras(allViews, requesterId);

  withExtras.sort((a, b) => {
    const key = input.sort === 'likes' ? 'totalLikes' : 'totalDislikes';
    return b[key] - a[key];
  });

  const total = withExtras.length;
  const start = (input.page - 1) * input.limit;
  const paged = withExtras.slice(start, start + input.limit);

  return { total, page: input.page, limit: input.limit, views: paged };
}

export async function getViewById(id: string, requester?: Requester) {
  const view = await prisma.politicalView.findUnique({ where: { id }, include: viewInclude });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }

  if (view.status === 'UNPUBLISHED') {
    const isOwnerOrAdmin = requester && (requester.id === view.authorId || requester.role === 'SUPERADMIN');
    if (!isOwnerOrAdmin) {
      throw ApiError.notFound('Political view not found');
    }
  }

  const [withExtras] = await attachExtras([view], requester?.id);
  return withExtras;
}

export async function updateView(id: string, requester: Requester, input: UpdateViewInput) {
  const view = await prisma.politicalView.findUnique({ where: { id }, include: { sides: true } });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }
  if (view.authorId !== requester.id && requester.role !== 'SUPERADMIN') {
    throw ApiError.forbidden('Only the author or a superadmin can edit this view');
  }

  await getActiveCategory(input.categoryId);
  const hashtags = await resolveHashtags(input.hashtags);

  const sideA = view.sides.find((s) => s.type === 'SIDE');
  const sideB = view.sides.find((s) => s.type === 'COUNTERPART');
  if (!sideA || !sideB) {
    throw ApiError.notFound('Political view not found');
  }

  await prisma.$transaction([
    prisma.source.deleteMany({ where: { viewSideId: sideA.id } }),
    prisma.source.deleteMany({ where: { viewSideId: sideB.id } }),
    prisma.viewSide.update({
      where: { id: sideA.id },
      data: { title: input.side.title, description: input.side.description, sources: { create: input.side.sources } },
    }),
    prisma.viewSide.update({
      where: { id: sideB.id },
      data: { title: input.counterpart.title, description: input.counterpart.description, sources: { create: input.counterpart.sources } },
    }),
    prisma.politicalView.update({
      where: { id },
      data: { categoryId: input.categoryId, hashtags: { set: hashtags.map((h) => ({ id: h.id })) } },
    }),
  ]);

  return getViewById(id, requester);
}

export async function unpublishView(id: string) {
  const view = await prisma.politicalView.findUnique({ where: { id } });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }
  return prisma.politicalView.update({ where: { id }, data: { status: 'UNPUBLISHED' } });
}

export async function publishView(id: string) {
  const view = await prisma.politicalView.findUnique({ where: { id } });
  if (!view) {
    throw ApiError.notFound('Political view not found');
  }
  return prisma.politicalView.update({ where: { id }, data: { status: 'PUBLISHED' } });
}

export async function listViewsForAdmin(input: ListAdminViewsInput) {
  const where = { ...(input.status ? { status: input.status } : {}) };

  const [total, views] = await Promise.all([
    prisma.politicalView.count({ where }),
    prisma.politicalView.findMany({
      where,
      include: viewInclude,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
  ]);

  const withExtras = await attachExtras(views);
  return { total, page: input.page, limit: input.limit, views: withExtras };
}
