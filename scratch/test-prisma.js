
import prisma from "../src/lib/prisma.js";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users count:", users.length);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    process.exit();
  }
}

main();
