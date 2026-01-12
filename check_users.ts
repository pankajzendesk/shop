import prisma from './src/lib/prisma'

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Users in DB:', users.length)
    users.forEach((u: any) => console.log(' - ' + u.email))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

await main()
