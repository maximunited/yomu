#!/bin/bash
# Database setup script - run after connecting Prisma to project

echo "📥 Pulling environment variables..."
vercel env pull .env.local --yes

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Pushing schema to database..."
npx prisma db push

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
echo "🚀 You can now run: npm run dev"
