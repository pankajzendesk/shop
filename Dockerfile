FROM node:26.3.1-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26.3.1-alpine3.23 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM node:26.3.1-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY docker-entrypoint.sh ./

EXPOSE 3000
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
