import '../load-env.mjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { catalogSeedCategories, catalogSeedProducts, buildSeedOptions } from './catalog-seed-data.mjs'
import { slugify } from '../server/lib/format.mjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Add it to .env before running this script.')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const seedProduct = async (categoryName, productData, sortOrder) => {
  const category = await prisma.category.upsert({
    where: { slug: slugify(categoryName) },
    create: {
      name: categoryName,
      slug: slugify(categoryName),
      sortOrder,
      isActive: true,
    },
    update: {
      name: categoryName,
      sortOrder,
      isActive: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: slugify(productData.title) },
    create: {
      categoryId: category.id,
      title: productData.title,
      slug: slugify(productData.title),
      publisher: productData.publisher,
      shortDescription: productData.shortDescription,
      description: productData.description,
      badge: productData.badge,
      accentColor: productData.accentColor,
      coverImageUrl: productData.coverImageUrl,
      status: 'ACTIVE',
      sortOrder,
    },
    update: {
      categoryId: category.id,
      title: productData.title,
      publisher: productData.publisher,
      shortDescription: productData.shortDescription,
      description: productData.description,
      badge: productData.badge,
      accentColor: productData.accentColor,
      coverImageUrl: productData.coverImageUrl,
      status: 'ACTIVE',
      sortOrder,
    },
  })

  await prisma.$transaction([
    prisma.productSupport.deleteMany({ where: { productId: product.id } }),
    prisma.productMedia.deleteMany({ where: { productId: product.id } }),
    prisma.productOption.deleteMany({ where: { productId: product.id } }),
  ])

  const options = buildSeedOptions(productData.basePrice, categoryName, productData.title)

  await Promise.all([
    prisma.productSupport.createMany({
      data: productData.supportLabels.map((label, index) => ({
        productId: product.id,
        label,
        sortOrder: index + 1,
      })),
    }),
    prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          mediaUrl: productData.coverImageUrl,
          altText: productData.title,
          sortOrder: 1,
        },
      ],
    }),
    prisma.productOption.createMany({
      data: options.map((option) => ({
        productId: product.id,
        name: option.name,
        serverName: option.serverName,
        perk: option.perk,
        guestPrice: option.guestPrice,
        memberPrice: option.memberPrice,
        stock: option.stock,
        isActive: option.isActive,
        sortOrder: option.sortOrder,
      })),
    }),
  ])

  return product
}

try {
  const result = []

  for (const category of catalogSeedCategories) {
    await prisma.category.upsert({
      where: { slug: slugify(category.name) },
      create: {
        name: category.name,
        slug: slugify(category.name),
        sortOrder: category.sortOrder,
        isActive: true,
      },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    })
  }

  for (const [index, product] of catalogSeedProducts.entries()) {
    result.push(await seedProduct(product.categoryName, product, index + 1))
  }

  console.log(
    JSON.stringify(
      {
        seeded: true,
        categories: catalogSeedCategories.length,
        products: result.length,
      },
      null,
      2,
    ),
  )
} finally {
  await prisma.$disconnect()
}

