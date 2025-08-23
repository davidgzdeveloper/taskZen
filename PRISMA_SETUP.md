# Prisma + Supabase Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install prisma @prisma/client
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database URL for Prisma
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Database Setup

#### Option A: Using Prisma Migrate (Recommended)
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

#### Option B: Using Prisma Push (Development)
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

### 4. Database Studio
View and edit your database with Prisma Studio:
```bash
npm run db:studio
```

## 📊 Database Schema

The application includes the following models:

- **User**: Basic user information
- **Profile**: Extended user profile data
- **Task**: Task management with status and priority

## 🔧 Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 🌐 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task
- `PATCH /api/tasks/[id]` - Move task between statuses

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication

All API endpoints require authentication via Supabase. The system automatically:
- Validates user sessions
- Associates tasks with authenticated users
- Provides secure data isolation

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` in `.env.local`
   - Check if Supabase database is running
   - Ensure your IP is whitelisted in Supabase

2. **Prisma Client Not Generated**
   - Run `npm run db:generate`
   - Restart your development server

3. **Migration Conflicts**
   - Reset database: `npx prisma migrate reset`
   - Re-run migrations: `npm run db:migrate`

### Getting Help

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

