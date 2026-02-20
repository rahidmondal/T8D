#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Applying Prisma migrations..."
  pnpm dlx prisma@6.17.1 migrate deploy --schema prisma/schema.prisma
  echo "[entrypoint] Prisma migrations complete."
else
  echo "[entrypoint] DATABASE_URL not set; skipping migrations."
fi

exec node dist/app.js
