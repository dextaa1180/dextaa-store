import '../load-env.mjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Add it to .env before running this script.')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

try {
  const [users, categories, products, orders, reviews, contactRequests] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.customerReview.count(),
    prisma.contactRequest.count(),
  ])

  console.log(
    JSON.stringify(
      {
        connected: true,
        users,
        categories,
        products,
        orders,
        reviews,
        contactRequests,
      },
      null,
      2,
    ),
  )
} finally {
  await prisma.$disconnect()
}
