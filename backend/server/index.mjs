import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary'
import cookieParser from 'cookie-parser'
import express from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { prisma } from './db.mjs'
import { catalogProductInclude, serializePublicProduct } from './lib/catalog.mjs'
import { slugify, toBool, toInt } from './lib/format.mjs'

const app = express()
const port = Number(process.env.API_PORT ?? 4000)
const sessionCookie = 'dextaa_session'
const jwtSecret = process.env.JWT_SECRET ?? 'dev-insecure-change-me'
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER ?? 'dextaa-store/products'
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('File harus berupa gambar.'))
      return
    }
    callback(null, true)
  },
})

const parsePagination = (query) => {
  const page = Math.max(1, toInt(query.page, 1))
  const pageSize = Math.min(50, Math.max(1, toInt(query.pageSize, 10)))
  const skip = (page - 1) * pageSize
  return { page, pageSize, skip }
}

app.use(express.json())
app.use(cookieParser())

const parseImageUpload = (request, response, next) => {
  imageUpload.single('image')(request, response, (error) => {
    if (!error) {
      next()
      return
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      response.status(413).json({ message: 'Ukuran gambar maksimal 5 MB.' })
      return
    }

    response.status(400).json({ message: error.message ?? 'Gagal membaca file gambar.' })
  })
}

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder,
        resource_type: 'image',
        transformation: [{ width: 900, height: 900, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary tidak mengembalikan hasil upload.'))
          return
        }
        resolve(result)
      },
    )

    stream.end(file.buffer)
  })

const resolveCloudinaryPublicIdFromUrl = (url) => {
  if (!url || !String(url).includes('res.cloudinary.com')) return null

  try {
    const parsedUrl = new URL(String(url))
    const parts = parsedUrl.pathname.split('/').filter(Boolean)
    const uploadIndex = parts.indexOf('upload')

    if (uploadIndex < 0 || uploadIndex >= parts.length - 1) return null

    const afterUpload = parts.slice(uploadIndex + 1)
    const versionIndex = afterUpload.findIndex((part) => /^v\d+$/.test(part))
    const assetParts = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload

    if (!assetParts.length) return null

    const lastPartIndex = assetParts.length - 1
    assetParts[lastPartIndex] = assetParts[lastPartIndex].replace(/\.[^.]+$/, '')
    return assetParts.join('/')
  } catch {
    return null
  }
}

const resolveProductCloudinaryPublicId = (product) =>
  product.coverImagePublicId ?? resolveCloudinaryPublicIdFromUrl(product.coverImageUrl)

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
})

const setSession = (response, user) => {
  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' })

  response.cookie(sessionCookie, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

const clearSession = (response) => {
  response.clearCookie(sessionCookie, { path: '/' })
}

const findUserByEmail = (email) =>
  prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  })

const requireAuth = (role) => async (request, response, next) => {
  try {
    const token = request.cookies[sessionCookie]

    if (!token) {
      response.status(401).json({ message: 'Belum login.' })
      return
    }

    const payload = jwt.verify(token, jwtSecret)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user || user.status !== 'ACTIVE') {
      clearSession(response)
      response.status(401).json({ message: 'Sesi tidak valid.' })
      return
    }

    if (role && user.role !== role) {
      response.status(403).json({ message: 'Akses tidak diizinkan.' })
      return
    }

    request.user = user
    next()
  } catch {
    clearSession(response)
    response.status(401).json({ message: 'Sesi sudah berakhir.' })
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/catalog', async (_request, response) => {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        category: { isActive: true },
      },
      include: catalogProductInclude,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    }),
  ])

  const counts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: {
      status: 'ACTIVE',
    },
    _count: {
      _all: true,
    },
  })

  const countMap = new Map(counts.map((row) => [row.categoryId, row._count._all]))

  response.json({
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      productCount: countMap.get(category.id) ?? 0,
    })),
    products: products.map(serializePublicProduct),
  })
})

app.get('/api/catalog/categories', async (_request, response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  const counts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: {
      status: 'ACTIVE',
    },
    _count: {
      _all: true,
    },
  })

  const countMap = new Map(counts.map((row) => [row.categoryId, row._count._all]))

  response.json({
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      productCount: countMap.get(category.id) ?? 0,
    })),
  })
})

app.get('/api/catalog/products', async (request, response) => {
  const q = String(request.query.q ?? '').trim()
  const categorySlug = String(request.query.category ?? '').trim()

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      category: {
        isActive: true,
        ...(categorySlug ? { slug: categorySlug } : {}),
      },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { publisher: { contains: q, mode: 'insensitive' } },
              { category: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: catalogProductInclude,
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  })

  response.json({ products: products.map(serializePublicProduct) })
})

app.get('/api/catalog/products/:slug', async (request, response) => {
  const { slug } = request.params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: catalogProductInclude,
  })

  if (!product || product.status !== 'ACTIVE' || !product.category.isActive) {
    response.status(404).json({ message: 'Produk tidak ditemukan.' })
    return
  }

  response.json({ product: serializePublicProduct(product) })
})

app.post('/api/auth/register', async (request, response) => {
  const { name, email, whatsapp, password } = request.body ?? {}

  if (!name || !email || !whatsapp || !password) {
    response.status(400).json({ message: 'Nama, email, WhatsApp, dan password wajib diisi.' })
    return
  }

  if (String(password).length < 8) {
    response.status(400).json({ message: 'Password minimal 8 karakter.' })
    return
  }

  const existingUser = await findUserByEmail(String(email))

  if (existingUser) {
    response.status(409).json({ message: 'Email sudah terdaftar.' })
    return
  }

  const passwordHash = await bcrypt.hash(String(password), 12)
  const user = await prisma.user.create({
    data: {
      name: String(name),
      email: String(email).trim().toLowerCase(),
      whatsapp: String(whatsapp).trim(),
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      customer: {
        create: {
          name: String(name),
          whatsapp: String(whatsapp).trim(),
          email: String(email).trim().toLowerCase(),
        },
      },
    },
  })

  setSession(response, user)
  response.status(201).json({ user: publicUser(user) })
})

app.post('/api/auth/login', async (request, response) => {
  const { email, password, role } = request.body ?? {}

  if (!email || !password) {
    response.status(400).json({ message: 'Email dan password wajib diisi.' })
    return
  }

  const user = await findUserByEmail(String(email))
  const passwordMatches = user ? await bcrypt.compare(String(password), user.passwordHash) : false

  if (!user || !passwordMatches) {
    response.status(401).json({ message: 'Email atau password salah.' })
    return
  }

  if (user.status !== 'ACTIVE') {
    response.status(403).json({ message: 'Akun tidak aktif.' })
    return
  }

  if (role && user.role !== role) {
    response.status(403).json({ message: 'Akun ini tidak memiliki akses admin.' })
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  setSession(response, user)
  response.json({ user: publicUser(user) })
})

app.post('/api/auth/logout', (_request, response) => {
  clearSession(response)
  response.json({ ok: true })
})

app.get('/api/auth/me', requireAuth(), (request, response) => {
  response.json({ user: publicUser(request.user) })
})

app.get('/api/admin/summary', requireAuth('ADMIN'), async (_request, response) => {
  const [products, orders, reviews, contactRequests] = await Promise.all([
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'PAID', 'PROCESSING'] } } }),
    prisma.customerReview.count({ where: { status: 'PENDING' } }),
    prisma.contactRequest.count({ where: { status: 'NEW' } }),
  ])

  response.json({
    products,
    orders,
    reviews,
    contactRequests,
  })
})

app.get('/api/admin/categories', requireAuth('ADMIN'), async (_request, response) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  response.json({ categories })
})

app.post('/api/admin/uploads/product-image', requireAuth('ADMIN'), parseImageUpload, async (request, response) => {
  try {
    if (!isCloudinaryConfigured) {
      response.status(500).json({ message: 'Cloudinary belum dikonfigurasi di environment backend.' })
      return
    }

    if (!request.file) {
      response.status(400).json({ message: 'Pilih file gambar terlebih dahulu.' })
      return
    }

    const result = await uploadBufferToCloudinary(request.file)
    response.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    const message =
      error?.error?.message ??
      error?.message ??
      'Upload gambar ke Cloudinary gagal.'
    const statusCode = error?.error?.http_code ?? error?.http_code ?? 502
    response.status(statusCode >= 400 ? statusCode : 502).json({ message })
  }
})

app.get('/api/admin/products', requireAuth('ADMIN'), async (request, response) => {
  const q = String(request.query.q ?? '').trim()
  const status = String(request.query.status ?? '').trim()
  const { page, pageSize, skip } = parsePagination(request.query)

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { publisher: { contains: q, mode: 'insensitive' } },
            { category: { name: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        options: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
    }),
  ])

  response.json({
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
})

app.post('/api/admin/products', requireAuth('ADMIN'), async (request, response) => {
  const {
    title,
    publisher,
    categoryName,
    badge,
    accentColor,
    coverImageUrl,
    coverImagePublicId,
    description,
    shortDescription,
    status,
    sortOrder,
  } = request.body ?? {}

  if (!title || !publisher || !categoryName) {
    response.status(400).json({ message: 'Title, publisher, dan categoryName wajib diisi.' })
    return
  }

  const normalizedCategoryName = String(categoryName).trim()
  const category = await prisma.category.upsert({
    where: { slug: slugify(normalizedCategoryName) },
    create: {
      name: normalizedCategoryName,
      slug: slugify(normalizedCategoryName),
      isActive: true,
    },
    update: {
      name: normalizedCategoryName,
    },
  })

  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      title: String(title).trim(),
      slug: slugify(title),
      publisher: String(publisher).trim(),
      badge: badge ? String(badge).trim() : null,
      accentColor: accentColor ? String(accentColor).trim() : null,
      coverImageUrl: coverImageUrl ? String(coverImageUrl).trim() : null,
      coverImagePublicId: coverImagePublicId ? String(coverImagePublicId).trim() : null,
      description: description ? String(description) : null,
      shortDescription: shortDescription ? String(shortDescription) : null,
      status: String(status ?? 'ACTIVE'),
      sortOrder: toInt(sortOrder, 0),
    },
    include: { category: true },
  })

  response.status(201).json({ product })
})

app.put('/api/admin/products/:id', requireAuth('ADMIN'), async (request, response) => {
  const { id } = request.params
  const {
    title,
    publisher,
    categoryName,
    badge,
    accentColor,
    coverImageUrl,
    coverImagePublicId,
    description,
    shortDescription,
    status,
    sortOrder,
  } = request.body ?? {}

  const existing = await prisma.product.findUnique({ where: { id } })

  if (!existing) {
    response.status(404).json({ message: 'Produk tidak ditemukan.' })
    return
  }

  let categoryId = existing.categoryId
  if (categoryName) {
    const normalizedCategoryName = String(categoryName).trim()
    const category = await prisma.category.upsert({
      where: { slug: slugify(normalizedCategoryName) },
      create: {
        name: normalizedCategoryName,
        slug: slugify(normalizedCategoryName),
        isActive: true,
      },
      update: {
        name: normalizedCategoryName,
      },
    })
    categoryId = category.id
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      categoryId,
      title: title ? String(title).trim() : existing.title,
      slug: title ? slugify(title) : existing.slug,
      publisher: publisher ? String(publisher).trim() : existing.publisher,
      badge: badge === '' ? null : badge ? String(badge).trim() : existing.badge,
      accentColor:
        accentColor === '' ? null : accentColor ? String(accentColor).trim() : existing.accentColor,
      coverImageUrl:
        coverImageUrl === ''
          ? null
          : coverImageUrl
            ? String(coverImageUrl).trim()
            : existing.coverImageUrl,
      coverImagePublicId:
        coverImageUrl === ''
          ? null
          : coverImagePublicId === ''
            ? null
            : coverImagePublicId
              ? String(coverImagePublicId).trim()
              : existing.coverImagePublicId,
      description: description === '' ? null : description ? String(description) : existing.description,
      shortDescription:
        shortDescription === ''
          ? null
          : shortDescription
            ? String(shortDescription)
            : existing.shortDescription,
      status: status ? String(status) : existing.status,
      sortOrder: sortOrder === undefined ? existing.sortOrder : toInt(sortOrder, existing.sortOrder),
    },
    include: { category: true },
  })

  response.json({ product })
})

app.delete('/api/admin/products/:id', requireAuth('ADMIN'), async (request, response) => {
  const { id } = request.params
  const existing = await prisma.product.findUnique({
    where: { id },
    select: {
      coverImageUrl: true,
      coverImagePublicId: true,
    },
  })

  if (!existing) {
    response.status(404).json({ message: 'Produk tidak ditemukan.' })
    return
  }

  const publicId = resolveProductCloudinaryPublicId(existing)
  let cleanupWarning = null

  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    } catch (error) {
      cleanupWarning = error?.error?.message ?? error?.message ?? 'Gagal menghapus asset Cloudinary.'
      console.warn('Cloudinary cleanup failed for product delete:', cleanupWarning)
    }
  }

  await prisma.product.delete({ where: { id } })
  response.json({ ok: true, cleanupWarning })
})

app.get('/api/admin/price-options', requireAuth('ADMIN'), async (request, response) => {
  const q = String(request.query.q ?? '').trim()
  const productId = String(request.query.productId ?? '').trim()
  const isActive = String(request.query.isActive ?? '').trim()
  const { page, pageSize, skip } = parsePagination(request.query)

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { serverName: { contains: q, mode: 'insensitive' } },
            { product: { title: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(productId ? { productId } : {}),
    ...(isActive ? { isActive: toBool(isActive, true) } : {}),
  }

  const [total, options] = await Promise.all([
    prisma.productOption.count({ where }),
    prisma.productOption.findMany({
      where,
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take: pageSize,
    }),
  ])

  response.json({
    options,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
})

app.post('/api/admin/price-options', requireAuth('ADMIN'), async (request, response) => {
  const { productId, name, serverName, perk, guestPrice, memberPrice, stock, isActive, sortOrder } =
    request.body ?? {}

  if (!productId || !name) {
    response.status(400).json({ message: 'productId dan name wajib diisi.' })
    return
  }

  const option = await prisma.productOption.create({
    data: {
      productId: String(productId),
      name: String(name).trim(),
      serverName: serverName ? String(serverName).trim() : null,
      perk: perk ? String(perk).trim() : null,
      guestPrice: toInt(guestPrice, 0),
      memberPrice: toInt(memberPrice, 0),
      stock: toInt(stock, 0),
      isActive: toBool(isActive, true),
      sortOrder: toInt(sortOrder, 0),
    },
    include: {
      product: {
        select: { id: true, title: true, slug: true },
      },
    },
  })

  response.status(201).json({ option })
})

app.put('/api/admin/price-options/:id', requireAuth('ADMIN'), async (request, response) => {
  const { id } = request.params
  const { productId, name, serverName, perk, guestPrice, memberPrice, stock, isActive, sortOrder } =
    request.body ?? {}

  const existing = await prisma.productOption.findUnique({ where: { id } })

  if (!existing) {
    response.status(404).json({ message: 'Item harga tidak ditemukan.' })
    return
  }

  const option = await prisma.productOption.update({
    where: { id },
    data: {
      productId: productId ? String(productId) : existing.productId,
      name: name ? String(name).trim() : existing.name,
      serverName:
        serverName === '' ? null : serverName ? String(serverName).trim() : existing.serverName,
      perk: perk === '' ? null : perk ? String(perk).trim() : existing.perk,
      guestPrice: guestPrice === undefined ? existing.guestPrice : toInt(guestPrice, existing.guestPrice),
      memberPrice:
        memberPrice === undefined ? existing.memberPrice : toInt(memberPrice, existing.memberPrice),
      stock: stock === undefined ? existing.stock : toInt(stock, existing.stock),
      isActive: isActive === undefined ? existing.isActive : toBool(isActive, existing.isActive),
      sortOrder: sortOrder === undefined ? existing.sortOrder : toInt(sortOrder, existing.sortOrder),
    },
    include: {
      product: {
        select: { id: true, title: true, slug: true },
      },
    },
  })

  response.json({ option })
})

app.delete('/api/admin/price-options/:id', requireAuth('ADMIN'), async (request, response) => {
  const { id } = request.params
  await prisma.productOption.delete({ where: { id } })
  response.json({ ok: true })
})

app.get('/api/admin/transactions', requireAuth('ADMIN'), async (request, response) => {
  const q = String(request.query.q ?? '').trim()
  const status = String(request.query.status ?? '').trim()
  const paymentStatus = String(request.query.paymentStatus ?? '').trim()
  const { page, pageSize, skip } = parsePagination(request.query)

  const where = {
    ...(q
      ? {
          OR: [
            { invoiceCode: { contains: q, mode: 'insensitive' } },
            { customerName: { contains: q, mode: 'insensitive' } },
            { customerWhatsapp: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  }

  const [total, transactions] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            productTitle: true,
            optionName: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: pageSize,
    }),
  ])

  response.json({
    transactions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
})

app.post('/api/admin/transactions', requireAuth('ADMIN'), async (request, response) => {
  const { invoiceCode, customerName, customerWhatsapp, subtotal, total, status, paymentStatus, notes } =
    request.body ?? {}

  if (!invoiceCode || !customerWhatsapp) {
    response.status(400).json({ message: 'invoiceCode dan customerWhatsapp wajib diisi.' })
    return
  }

  const transaction = await prisma.order.create({
    data: {
      invoiceCode: String(invoiceCode).trim().toUpperCase(),
      customerName: customerName ? String(customerName).trim() : null,
      customerWhatsapp: String(customerWhatsapp).trim(),
      subtotal: toInt(subtotal, 0),
      total: toInt(total, 0),
      status: String(status ?? 'PENDING'),
      paymentStatus: String(paymentStatus ?? 'UNPAID'),
      notes: notes ? String(notes) : null,
    },
  })

  response.status(201).json({ transaction })
})

app.put('/api/admin/transactions/:id', requireAuth('ADMIN'), async (request, response) => {
  const { id } = request.params
  const { customerName, customerWhatsapp, subtotal, total, status, paymentStatus, notes } = request.body ?? {}

  const existing = await prisma.order.findUnique({ where: { id } })

  if (!existing) {
    response.status(404).json({ message: 'Transaksi tidak ditemukan.' })
    return
  }

  const transaction = await prisma.order.update({
    where: { id },
    data: {
      customerName:
        customerName === '' ? null : customerName ? String(customerName).trim() : existing.customerName,
      customerWhatsapp: customerWhatsapp ? String(customerWhatsapp).trim() : existing.customerWhatsapp,
      subtotal: subtotal === undefined ? existing.subtotal : toInt(subtotal, existing.subtotal),
      total: total === undefined ? existing.total : toInt(total, existing.total),
      status: status ? String(status) : existing.status,
      paymentStatus: paymentStatus ? String(paymentStatus) : existing.paymentStatus,
      notes: notes === '' ? null : notes ? String(notes) : existing.notes,
    },
  })

  response.json({ transaction })
})

app.delete('/api/admin/transactions/:id', requireAuth('ADMIN'), async (request, response) => {
  const { id } = request.params
  await prisma.order.delete({ where: { id } })
  response.json({ ok: true })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: 'Terjadi kesalahan server.' })
})

app.listen(port, () => {
  console.log(`DextaaStore API running on http://localhost:${port}`)
})
