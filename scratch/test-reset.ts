import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function testReset() {
  const email = "attaullah.khan@focusitservices.co.uk"; // from the screenshot
  const password = "NewPassword123";

  console.log("Checking user:", email);
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found!");
      return;
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("Updating user...");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log("Success!");
  } catch (err) {
    console.error("FAILED with error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testReset();
