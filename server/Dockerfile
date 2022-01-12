FROM node:16-alpine as builderdeps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:16-alpine as builder
WORKDIR /app
COPY --from=builderdeps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:16-alpine as runnerdeps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

FROM node:16-alpine as runner
WORKDIR /app

COPY --chown=nodejs:nodejs package.json yarn.lock ./
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