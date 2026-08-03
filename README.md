# Doscaras API

REST API for a political-views social network. Authenticated users publish a
political view made of two opposing sides (`side` and `counterpart`), each
with a title, description, and one or more sources (link, YouTube, or
document). Users can like/dislike a view and open comment threads on it.
Superadmins can unpublish a view from the public board.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Zod request validation
- Multer for document uploads

Dependencies are pinned to Express 4 / Zod 3 / TypeScript 5 / Prisma 5 for
compatibility with Node 18 and with the code in this repo (avoid the Express
5 / Zod 4 / Prisma 7 majors that `npm install` would otherwise resolve to).

## Setup

```bash
npm install
cp .env.example .env   # edit DATABASE_URL, JWT_SECRET, SUPERADMIN_* as needed
npx prisma migrate dev --name init
npx prisma db seed      # seeds default categories + a superadmin user
npm run dev              # http://localhost:3000
```

## Docker

```bash
docker compose up -d --build   # http://localhost:3000
```

Starts Postgres and the API. On startup the API container runs
`prisma migrate deploy` and seeds default categories + the superadmin user
(set `RUN_SEED=false` to skip seeding). Config is read from `.env` in this
directory (`JWT_SECRET`, `SUPERADMIN_*`, etc. — `DATABASE_URL` is ignored in
favor of the in-network `db` service). Uploaded files persist in the
`uploads` named volume; Postgres data persists in `pgdata`.

## Data model

- **User** — `email`, `password` (hashed), `name`, `role` (`USER` | `SUPERADMIN`)
- **Category** — flat list, e.g. Economy, Healthcare, Immigration
- **PoliticalView** — belongs to a `Category` and an author `User`;
  `status` is `PUBLISHED` | `UNPUBLISHED`
- **ViewSide** — one of `SIDE` / `COUNTERPART` per `PoliticalView`; each has
  `title`, `description`, and `Source[]`
- **Source** — `type` (`LINK` | `YOUTUBE` | `DOCUMENT`), `url`, optional `label`
- **Reaction** — one `LIKE`/`DISLIKE` per user per `PoliticalView` (upsert)
- **CommentThread** — belongs to a `PoliticalView`; a view can have many
- **Comment** — belongs to a thread, optional `parentId` for one-level replies

## Auth

All protected routes expect `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns token |
| POST | `/api/auth/login` | — | Returns token |
| GET | `/api/auth/me` | user | Current user profile |

## Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | — | List all categories |
| POST | `/api/categories` | superadmin | Create a category |

## Political views (the board)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/political-views?category=&sortBy=recent\|likes\|dislikes&page=&pageSize=` | — | List active (published) views |
| POST | `/api/political-views` | user | Create a view (`categoryId`, `side`, `counterpart`) |
| GET | `/api/political-views/:id` | — | Full detail incl. sides/sources/counts |
| PATCH | `/api/political-views/:id/unpublish` | superadmin | Remove from the board |

Create payload shape:

```json
{
  "categoryId": "uuid",
  "side": {
    "title": "...",
    "description": "...",
    "sources": [{ "type": "LINK", "url": "https://...", "label": "optional" }]
  },
  "counterpart": {
    "title": "...",
    "description": "...",
    "sources": [{ "type": "YOUTUBE", "url": "https://youtube.com/watch?v=..." }]
  }
}
```

## Reactions

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/political-views/:id/reactions` | user | Body `{ "type": "LIKE" \| "DISLIKE" }`; upserts (switching type is allowed) |
| DELETE | `/api/political-views/:id/reactions` | user | Remove your own reaction |

## Comment threads & comments

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/political-views/:id/threads` | — | List threads (with top-level comments + replies) |
| POST | `/api/political-views/:id/threads` | user | Body `{ "title"?, "content" }` — opens a thread with its first comment |
| GET | `/api/political-views/:id/threads/:threadId/comments` | — | List top-level comments + replies |
| POST | `/api/political-views/:id/threads/:threadId/comments` | user | Body `{ "content", "parentId"? }` — `parentId` makes it a reply |

## Document uploads

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/uploads/document` | user | multipart field `file` (PDF/DOC/DOCX/TXT, max 20MB). Returns `{ "url": "/uploads/xyz.pdf" }` to use as a `DOCUMENT` source's `url` |

Uploaded files are served statically from `/uploads/*`.

## Notes / tradeoffs

- Sorting the board by `likes`/`dislikes` computes counts for all matching
  published views, sorts in memory, then paginates — fine at board scale;
  would need a materialized count column for very large datasets.
- JWTs are long-lived (`JWT_EXPIRES_IN`, default 7d) with no refresh-token
  flow — add one if session revocation becomes a requirement.
- Comments support one level of replies (reply-to-a-reply is not modeled);
  extend `Comment.parentId` handling if deeper nesting is needed.
