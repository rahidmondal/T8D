#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Applying Prisma migrations..."
  pnpm dlx prisma migrate deploy --schema prisma/schema.prisma
  echo "[entrypoint] Prisma migrations complete."
else
  echo "[entrypoint] DATABASE_URL not set; skipping migrations."
fi

exec node dist/app.js
