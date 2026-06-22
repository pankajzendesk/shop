#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting Next.js application..."
exec node node_modules/next/dist/bin/next start -p 3000
