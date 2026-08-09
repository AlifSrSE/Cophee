import { PrismaClient } from "@prisma/client/.prisma/client/default";
const prisma = new PrismaClient();
prisma.category.findMany();
