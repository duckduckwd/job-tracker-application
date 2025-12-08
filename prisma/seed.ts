import { PrismaClient } from "../generated/prisma";

async function main() {
  const prisma = new PrismaClient();

  try {
    // Add your seed data here
    console.log("Seeding database...");
  } catch (e: unknown) {
    console.error(e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
