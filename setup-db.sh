#!/bin/bash
set -euo pipefail

# setup-db.sh - Automated script to initialize a PostgreSQL database for GadgetToyShop

echo "🚀 Starting Database Initialization..."

# 1. Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# 2. Verify DATABASE_URL is set and non-empty
DATABASE_URL_VALUE=$(grep -E '^DATABASE_URL=' .env | tail -n 1 | cut -d '=' -f2- || true)

if [ -z "${DATABASE_URL_VALUE}" ]; then
    echo "❌ Error: DATABASE_URL not found or empty in .env"
    exit 1
fi

echo "✅ Environment configured."

# 3. Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate
echo "✅ Client generated."

# 4. Push the schema to the database
echo "📦 Pushing Prisma schema to the database..."
npx prisma db push

echo "✅ Schema pushed successfully."

# 5. Seed the database
echo "🌱 Seeding initial data (Products, Categories, Admin)..."
npx prisma db seed

echo "✅ Seeding completed."

echo ""
echo "🎉 SUCCESS! Your new database is ready to use."
echo "----------------------------------------------"
echo "You can now start the application with: npm run dev"
echo "Admin Login: admin@toyshop.com"
echo "----------------------------------------------"
