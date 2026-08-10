try {
  const pkg = require.resolve('prisma/package.json');
  console.log('Found prisma package.json at:', pkg);
  const prismaPath = require.resolve('prisma');
  console.log('Found prisma at:', prismaPath);
} catch (e) {
  console.error('Cannot find prisma:', e.message);
}
