FROM node:18 AS build

WORKDIR /app


COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/


RUN npm install -g pnpm && pnpm install


COPY . .

RUN pnpm frontend:build


# Use a minimal web server to serve the built files.

FROM nginx:alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html/T8D/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
