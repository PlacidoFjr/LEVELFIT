import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Uso: npm run user:verify -- usuario@email.com");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL nao encontrada no ambiente.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const now = new Date();
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, email: true, status: true, emailVerifiedAt: true },
  });

  if (!user) {
    console.error(`Usuario nao encontrado: ${email}`);
    process.exitCode = 1;
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { status: "active", emailVerifiedAt: user.emailVerifiedAt ?? now },
    }),
    prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.userSecurityEvent.create({
      data: { userId: user.id, type: "email_changed", metadata: { reason: "manual_test_verification" } },
    }),
  ]);

  console.log(`Usuario verificado para teste: ${user.email}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
