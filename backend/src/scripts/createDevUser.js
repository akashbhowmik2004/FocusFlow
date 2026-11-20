import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function main() {
  const hash = await bcrypt.hash("DevFocusFlow2026!", 10);
  const user = await prisma.user.upsert({
    where: {
      email: "dev@focusflow.local",
    },
    update: {
      passwordHash: hash,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date("2026-10-15T00:00:00.000Z"),
    },
    create: {
      name: "FocusFlow Developer",
      email: "dev@focusflow.local",
      passwordHash: hash,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date("2026-10-15T00:00:00.000Z"),
    },
  });

  console.log("Development user updated:", user.id, user.email, "onboardingCompleted:", user.onboardingCompleted);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
