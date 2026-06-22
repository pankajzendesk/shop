#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Cleaning and seeding database..."
npx tsx clean-slate.ts

echo "Starting Next.js application..."
exec node node_modules/next/dist/bin/next start -p 3000
