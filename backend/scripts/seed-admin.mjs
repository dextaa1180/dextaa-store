import '../load-env.mjs'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME ?? 'Dextaa Admin'

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Add it to .env before running this script.')
}

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed an admin account.')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

try {
  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    update: {
      name,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  })

  console.log(
    JSON.stringify(
      {
        seeded: true,
        admin,
      },
      null,
      2,
    ),
  )
} finally {
  await prisma.$disconnect()
}
