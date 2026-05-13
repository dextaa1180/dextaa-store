import '../load-env.mjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Add it to .env before starting the API server.')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })
