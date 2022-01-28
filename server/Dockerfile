FROM node:16-alpine as builder
RUN npm --silent install --global --depth 0 pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY src ./src
RUN pnpm build

FROM node:16-alpine as runner
WORKDIR /app

COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 4000

ENV PORT 4000

CMD ["node", "dist/server.js"]