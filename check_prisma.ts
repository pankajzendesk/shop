import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
console.log('Order fields:', Object.keys((prisma as any)._baseSelectedFields?.Order || {}))
process.exit(0)
