
import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`FocusFlow API running on port ${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down FocusFlow API...");

  server.close(async () => {
    try {
      const { prisma } = await import("./src/lib/prisma.js");
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
