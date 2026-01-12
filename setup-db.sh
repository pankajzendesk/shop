#!/bin/bash

# setup-db.sh - Automated script to initialize a fresh PostgreSQL database for GadgetToyShop

echo "🚀 Starting Database Initialization..."

# 1. Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# 2. Verify DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ Error: DATABASE_URL not found in .env"
    exit 1
fi

echo "✅ Environment configured."

# 3. Push the schema to the new DB
echo "📦 Pushing Prisma schema to the database..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to push schema. Check your DATABASE_URL and network."
    exit 1
fi
echo "✅ Schema pushed successfully."

# 4. Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate
echo "✅ Client generated."

# 5. Seed the database
echo "🌱 Seeding initial data (Products, Categories, Admin)..."
npx prisma db seed

if [ $? -ne 0 ]; then
    echo "❌ Error: Seeding failed."
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Your new database is ready to use."
echo "----------------------------------------------"
echo "You can now start the application with: npm run dev"
echo "Admin Login: admin@toyshop.com"
echo "----------------------------------------------"
