import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function main() {
  try {
    const prisma = new PrismaClient();
    console.log("Prisma client created");
    console.log("Prisma client models:", Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k] === 'object'));
    console.log("Has appRole:", 'appRole' in prisma);
    await prisma.$disconnect();
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
