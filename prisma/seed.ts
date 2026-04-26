// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Simple initialization for Prisma 7.
const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- Cleaning database ---');
    // Order matters for deletion! Delete children before parents.
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('--- Seeding Categories ---');
    const categoryNames = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Toys'];
    const categories = await Promise.all(
        categoryNames.map((name) =>
            prisma.category.create({
                data: {
                    name,
                    slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(4),
                },
            })
        )
    );

    console.log('--- Seeding 10 Users ---');
    const users = [];
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password123', // Hardcoded for easy dev testing
            },
        });
        users.push(user);
    }

    console.log('--- Seeding 15 Products ---');
    const products = [];
    for (let i = 0; i < 15; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const product = await prisma.product.create({
            data: {
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
                stock: faker.number.int({ min: 1, max: 100 }),
                image: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
                categoryId: randomCategory.id,
            },
        });
        products.push(product);
    }

    console.log('--- Seeding 20 Orders ---');
    const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    for (let i = 0; i < 20; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const numItems = faker.number.int({ min: 1, max: 4 });
        const selectedProducts = faker.helpers.arrayElements(products, numItems);
        
        const orderItemsData = selectedProducts.map(p => ({
            productId: p.id,
            quantity: faker.number.int({ min: 1, max: 3 }),
            price: p.price
        }));

        const total = orderItemsData.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        await prisma.order.create({
            data: {
                customerId: randomUser.id,
                total: total,
                status: faker.helpers.arrayElement(statuses),
                orderItems: {
                    create: orderItemsData
                }
            }
        });
    }

    console.log('--- Seeding Complete! ---');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });