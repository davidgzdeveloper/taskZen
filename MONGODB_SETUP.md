# MongoDB Atlas + Prisma Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install prisma @prisma/client jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# MongoDB Atlas Connection String
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/taskzen?retryWrites=true&w=majority"

# JWT Secret (change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 3. Database Setup

#### Option A: Using Prisma Push (Recommended for MongoDB)
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

#### Option B: Using Prisma Migrate (Advanced)
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

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

- **User**: Basic user information with password
- **Profile**: Extended user profile data
- **Task**: Task management with status and priority

## 🔧 Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Sign in existing user
- `GET /api/auth/verify` - Verify JWT token

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

The system uses JWT tokens for authentication:

1. **Sign Up**: User creates account, receives JWT token
2. **Sign In**: User authenticates, receives JWT token
3. **API Calls**: Include token in Authorization header: `Bearer <token>`
4. **Middleware**: Automatically validates tokens for protected routes

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` in `.env.local`
   - Check if MongoDB Atlas cluster is running
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **Prisma Client Not Generated**
   - Run `npm run db:generate`
   - Restart your development server

3. **JWT Token Issues**
   - Verify `JWT_SECRET` is set in `.env.local`
   - Check token expiration
   - Ensure Authorization header format: `Bearer <token>`

### Getting Help

- [Prisma MongoDB Documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [JWT Documentation](https://jwt.io/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🔒 Security Notes

- **JWT_SECRET**: Use a strong, random secret in production
- **Password Hashing**: Passwords are automatically hashed with bcrypt
- **Token Expiration**: JWT tokens expire after 7 days
- **HTTPS**: Always use HTTPS in production for secure token transmission




