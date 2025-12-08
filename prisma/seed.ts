import { PrismaClient } from "../generated/prisma";

async function main() {
  const prisma = new PrismaClient();

  try {
    // Add your seed data here
    console.log("Seeding database...");
  } catch (error: unknown) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
