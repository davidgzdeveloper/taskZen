import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@taskzen.com' },
    update: {},
    create: {
      email: 'demo@taskzen.com',
      password: hashedPassword,
      fullName: 'Demo User',
    },
  })

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Complete project setup',
        description: 'Set up the development environment and install dependencies',
        status: 'DONE',
        priority: 'HIGH',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design user interface',
        description: 'Create wireframes and mockups for the application',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write documentation',
        description: 'Document the API endpoints and user guide',
        status: 'TODO',
        priority: 'LOW',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement authentication',
        description: 'Implement JWT authentication with bcrypt password hashing',
        status: 'DONE',
        priority: 'HIGH',
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Add task management',
        description: 'Implement CRUD operations for tasks',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user.id,
      },
    }),
  ])

  // Profile data is now stored directly in User model
  // No need to create separate profile

  console.log(`✅ Created ${tasks.length} sample tasks`)
  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
