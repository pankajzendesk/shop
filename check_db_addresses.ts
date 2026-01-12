import prisma from './src/lib/prisma';

try {
  const users = await prisma.user.findMany({
    include: {
      addresses: true,
    },
  });

  console.log('Total Users:', users.length);
  users.forEach((u: any) => {
    console.log(`User: ${u.email} (${u.name})`);
    console.log(`- Addresses: ${u.addresses.length}`);
    u.addresses.forEach((a: any) => {
      console.log(`  - ${a.addressLine1}, ${a.city} (Default: ${a.isDefault})`);
    });
  });
} catch (error) {
  console.error(error);
}
