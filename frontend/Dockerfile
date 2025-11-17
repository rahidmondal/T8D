# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM dependencies AS build
WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
RUN pnpm build

# ---- Production ----
FROM nginx:1.25-alpine AS production
COPY --from=build /app/frontend/dist /usr/share/nginx/html/T8D
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

