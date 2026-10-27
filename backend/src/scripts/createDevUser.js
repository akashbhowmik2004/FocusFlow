
import { prisma } from "../lib/prisma.js";

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "dev@focusflow.local",
    },
    update: {},
    create: {
      name: "FocusFlow Developer",
      email: "dev@focusflow.local",
    },
  });

  console.log("Development user:", user.id);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
