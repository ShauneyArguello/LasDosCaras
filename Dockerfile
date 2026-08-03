# --- Builder: install deps, generate Prisma client, compile TypeScript ---
FROM node:18-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Runner: production image ---
FROM node:18-alpine AS runner

RUN apk add --no-cache openssl

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json package-lock.json tsconfig.json ./
COPY docker-entrypoint.sh ./

RUN mkdir -p uploads \
  && chmod +x docker-entrypoint.sh \
  && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
