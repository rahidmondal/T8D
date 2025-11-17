# ---- Base ----
FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM dependencies AS build
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN pnpm dlx prisma generate
RUN pnpm build

# ---- Production ----
FROM base AS production
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/backend/package.json ./backend/
RUN npm install -g pnpm
RUN pnpm install --filter t8d-sync-server --prod --frozen-lockfile

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
WORKDIR /app/backend
RUN pnpm dlx prisma generate
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
