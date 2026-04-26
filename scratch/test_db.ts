import prisma from "../src/lib/prisma";

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log(`SUCCESS: Connected to database. Total users: ${userCount}`);
  } catch (error) {
    console.error("FAILURE: Could not connect to database.");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
