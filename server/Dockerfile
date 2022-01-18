FROM node:16-alpine as builderdeps
RUN npm --silent install --global --depth 0 pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:16-alpine as builder
RUN npm --silent install --global --depth 0 pnpm
WORKDIR /app
COPY --from=builderdeps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:16-alpine as runnerdeps
RUN npm --silent install --global --depth 0 pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:16-alpine as runner
WORKDIR /app

COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml ./
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist
COPY --chown=nodejs:nodejs --from=runnerdeps /app/node_modules ./node_modules

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 4000

ENV PORT 4000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "dist/index.js"]