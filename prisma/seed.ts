import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.info("🌱 Seeding database...");

  // Example: Create users
  // const user = await prisma.user.upsert({
  //   where: { email: "user@example.com" },
  //   update: {},
  //   create: {
  //     email: "user@example.com",
  //     name: "Test User",
  //   },
  // });

  // Example: Create related data
  // await prisma.post.createMany({
  //   data: [
  //     { title: "First Post", userId: user.id },
  //     { title: "Second Post", userId: user.id },
  //   ],
  //   skipDuplicates: true,
  // });

  console.info("✅ Seeding completed");
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
