import jwt from 'jsonwebtoken'
import { prisma } from '../db.mjs'

export const sessionCookie = 'dextaa_session'
export const jwtSecret = process.env.JWT_SECRET ?? 'dev-insecure-change-me'

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  whatsapp: user.whatsapp,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
})

export const setSession = (response, user) => {
  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' })

  response.cookie(sessionCookie, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export const clearSession = (response) => {
  response.clearCookie(sessionCookie, { path: '/' })
}

export const findUserByEmail = (email) =>
  prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  })

export const requireAuth = (role) => async (request, response, next) => {
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
