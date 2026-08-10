import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const ownerRole = await tx.appRole.upsert({
      where: { name: "OWNER" },
      update: {},
      create: {
        name: "OWNER",
        description: "Full system access",
        permissions: { all: true },
      },
    });

    const managerRole = await tx.appRole.upsert({
      where: { name: "MANAGER" },
      update: {},
      create: {
        name: "MANAGER",
        description: "POS and reports access",
        permissions: { pos: true, reports: true, inventory: true },
      },
    });

    const staffRole = await tx.appRole.upsert({
      where: { name: "STAFF" },
      update: {},
      create: {
        name: "STAFF",
        description: "Orders and inventory access",
        permissions: { pos: true, inventory: true },
      },
    });

    const ownerPassword = await hash("owner123");
    const managerPassword = await hash("manager123");
    const staffPassword = await hash("staff123");

    const ownerUser = await tx.user.upsert({
      where: { email: "owner@cophee.com" },
      update: {},
      create: {
        email: "owner@cophee.com",
        passwordHash: ownerPassword,
        name: "Owner User",
        roleId: ownerRole.id,
      },
    });

    const managerUser = await tx.user.upsert({
      where: { email: "manager@cophee.com" },
      update: {},
      create: {
        email: "manager@cophee.com",
        passwordHash: managerPassword,
        name: "Manager User",
        roleId: managerRole.id,
      },
    });

    const staffUser = await tx.user.upsert({
      where: { email: "staff@cophee.com" },
      update: {},
      create: {
        email: "staff@cophee.com",
        passwordHash: staffPassword,
        name: "Staff User",
        roleId: staffRole.id,
      },
    });

    await tx.employee.upsert({
      where: { userId: ownerUser.id },
      update: {},
      create: { userId: ownerUser.id },
    });

    await tx.employee.upsert({
      where: { userId: managerUser.id },
      update: {},
      create: { userId: managerUser.id },
    });

    await tx.employee.upsert({
      where: { userId: staffUser.id },
      update: {},
      create: { userId: staffUser.id },
    });

    const coffeeCategory = await tx.category.upsert({
      where: { name: "Coffee" },
      update: {},
      create: { name: "Coffee", description: "Hot and cold coffee drinks", sortOrder: 1 },
    });

    const pastryCategory = await tx.category.upsert({
      where: { name: "Pastries" },
      update: {},
      create: { name: "Pastries", description: "Fresh baked goods", sortOrder: 2 },
    });

    const inventoryCoffee = await tx.inventoryItem.upsert({
      where: { name: "Coffee Beans" },
      update: {},
      create: { name: "Coffee Beans", unit: "g", currentStock: 5000, minStock: 1000, costPerUnit: 0.02 },
    });

    const inventoryMilk = await tx.inventoryItem.upsert({
      where: { name: "Milk" },
      update: {},
      create: { name: "Milk", unit: "ml", currentStock: 10000, minStock: 2000, costPerUnit: 0.005 },
    });

    const inventorySugar = await tx.inventoryItem.upsert({
      where: { name: "Sugar" },
      update: {},
      create: { name: "Sugar", unit: "g", currentStock: 3000, minStock: 500, costPerUnit: 0.002 },
    });

    const inventoryFlour = await tx.inventoryItem.upsert({
      where: { name: "Flour" },
      update: {},
      create: { name: "Flour", unit: "g", currentStock: 4000, minStock: 1000, costPerUnit: 0.003 },
    });

    const inventoryButter = await tx.inventoryItem.upsert({
      where: { name: "Butter" },
      update: {},
      create: { name: "Butter", unit: "g", currentStock: 2000, minStock: 500, costPerUnit: 0.01 },
    });

    const espresso = await tx.product.upsert({
      where: { name: "Espresso" },
      update: {},
      create: { name: "Espresso", description: "Single shot espresso", price: 2.5, categoryId: coffeeCategory.id },
    });

    const latte = await tx.product.upsert({
      where: { name: "Latte" },
      update: {},
      create: { name: "Latte", description: "Espresso with steamed milk", price: 4.5, categoryId: coffeeCategory.id },
    });

    const cappuccino = await tx.product.upsert({
      where: { name: "Cappuccino" },
      update: {},
      create: { name: "Cappuccino", description: "Espresso with foam", price: 4.0, categoryId: coffeeCategory.id },
    });

    const croissant = await tx.product.upsert({
      where: { name: "Croissant" },
      update: {},
      create: { name: "Croissant", description: "Buttery flaky pastry", price: 3.5, categoryId: pastryCategory.id },
    });

    const muffin = await tx.product.upsert({
      where: { name: "Muffin" },
      update: {},
      create: { name: "Muffin", description: "Blueberry muffin", price: 3.0, categoryId: pastryCategory.id },
    });

    await tx.productIngredient.upsert({
      where: { id: `${espresso.id}-${inventoryCoffee.id}` },
      update: {},
      create: { productId: espresso.id, inventoryItemId: inventoryCoffee.id, quantity: 18 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${latte.id}-${inventoryCoffee.id}` },
      update: {},
      create: { productId: latte.id, inventoryItemId: inventoryCoffee.id, quantity: 18 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${latte.id}-${inventoryMilk.id}` },
      update: {},
      create: { productId: latte.id, inventoryItemId: inventoryMilk.id, quantity: 200 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${cappuccino.id}-${inventoryCoffee.id}` },
      update: {},
      create: { productId: cappuccino.id, inventoryItemId: inventoryCoffee.id, quantity: 18 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${cappuccino.id}-${inventoryMilk.id}` },
      update: {},
      create: { productId: cappuccino.id, inventoryItemId: inventoryMilk.id, quantity: 100 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${croissant.id}-${inventoryFlour.id}` },
      update: {},
      create: { productId: croissant.id, inventoryItemId: inventoryFlour.id, quantity: 120 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${croissant.id}-${inventoryButter.id}` },
      update: {},
      create: { productId: croissant.id, inventoryItemId: inventoryButter.id, quantity: 60 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${muffin.id}-${inventoryFlour.id}` },
      update: {},
      create: { productId: muffin.id, inventoryItemId: inventoryFlour.id, quantity: 100 },
    });

    await tx.productIngredient.upsert({
      where: { id: `${muffin.id}-${inventorySugar.id}` },
      update: {},
      create: { productId: muffin.id, inventoryItemId: inventorySugar.id, quantity: 40 },
    });

    for (let i = 1; i <= 10; i++) {
      await tx.table.upsert({
        where: { number: i },
        update: {},
        create: { number: i, capacity: 4, status: "AVAILABLE" },
      });
    }

    console.log("Seed data created successfully");
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
