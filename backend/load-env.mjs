import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const thisFilePath = fileURLToPath(import.meta.url)
const backendRoot = dirname(thisFilePath)
const envPath = resolve(backendRoot, '.env')

dotenv.config({ path: envPath })
