# Install dependencies only when needed
FROM node:lts-alpine3.19 AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

FROM node:lts-alpine3.19 AS stage

WORKDIR /app

COPY . .
COPY --from=deps /app/package.json  ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Rebuild the source code only when needed
FROM node:lts-alpine3.19 AS builder

WORKDIR /app

COPY --from=stage /app ./

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM node:lts-alpine3.19 AS prod

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

CMD ["npm", "start"]

# Development image, copy all the files and run next
FROM node:lts-alpine3.19 AS dev

WORKDIR /app

RUN chown -R node:node /app

USER node

ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=stage --chown=node:node /app/node_modules ./node_modules
COPY --from=stage --chown=node:node /app/package.json ./package.json
COPY --from=stage --chown=node:node /app/.env ./.env
COPY --from=stage --chown=node:node /app/tsconfig.json ./tsconfig.json 

CMD ["npm", "run", "dev"]
