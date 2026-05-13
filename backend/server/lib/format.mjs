export const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const toInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const toBool = (value, fallback = true) => {
  if (typeof value === 'boolean') return value
  if (value === 'false') return false
  if (value === 'true') return true
  return fallback
}
