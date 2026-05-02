import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- Cleaning database ---');
    await prisma.stockLog.deleteMany();
    await prisma.productSupplier.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('--- Seeding 100 Categories ---');
    const categoriesData = [];
    for (let i = 0; i < 100; i++) {
        const name = faker.commerce.department() + ' ' + faker.string.alphanumeric(3);
        categoriesData.push({
            name,
            slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(6),
        });
    }
    await prisma.category.createMany({ data: categoriesData });
    const categories = await prisma.category.findMany();

    console.log('--- Seeding 100 Users ---');
    const usersData = [];
    for (let i = 0; i < 100; i++) {
        usersData.push({
            name: faker.person.fullName(),
            email: faker.internet.email().toLowerCase() + i,
            password: 'password123',
        });
    }
    await prisma.user.createMany({ data: usersData });
    const users = await prisma.user.findMany();

    console.log('--- Seeding 100 Suppliers ---');
    const suppliersData = [];
    for (let i = 0; i < 100; i++) {
        suppliersData.push({
            name: faker.company.name(),
            email: faker.internet.email().toLowerCase(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            isActive: faker.datatype.boolean(0.8),
        });
    }
    await prisma.supplier.createMany({ data: suppliersData });
    const suppliers = await prisma.supplier.findMany();

    console.log('--- Seeding 1000 Products ---');
    const productsData = [];
    for (let i = 0; i < 1000; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        productsData.push({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
            stock: faker.number.int({ min: 1, max: 200 }),
            image: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
            categoryId: randomCategory.id,
            sku: faker.string.alphanumeric(8).toUpperCase(),
            costPrice: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
            lowStockAlert: faker.number.int({ min: 5, max: 20 }),
        });
    }
    await prisma.product.createMany({ data: productsData });
    const products = await prisma.product.findMany();

    console.log('--- Seeding Product-Supplier Links ---');
    const productSupplierData = [];
    for (const product of products) {
        const numSuppliers = faker.number.int({ min: 1, max: 2 });
        const selectedSuppliers = faker.helpers.arrayElements(suppliers, numSuppliers);
        for (const supplier of selectedSuppliers) {
            productSupplierData.push({
                productId: product.id,
                supplierId: supplier.id,
                costPrice: product.costPrice || 10,
                leadDays: faker.number.int({ min: 1, max: 14 }),
                minOrderQty: faker.number.int({ min: 1, max: 50 }),
            });
        }
    }
    await prisma.productSupplier.createMany({ data: productSupplierData });

    console.log('--- Seeding 1000 Orders ---');
    const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    const ordersData = [];
    for (let i = 0; i < 1000; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        ordersData.push({
            id: faker.string.uuid(),
            customerId: randomUser.id,
            total: 0, // Will update via items
            status: faker.helpers.arrayElement(statuses),
            createdAt: faker.date.past({ years: 1 }),
        });
    }
    await prisma.order.createMany({ data: ordersData });
    // We need the orders with their generated IDs if we didn't specify them,
    // but here I specified UUIDs to make it easier to link items.
    
    console.log('--- Seeding Order Items ---');
    const orderItemsData = [];
    const updatedOrders = [];

    for (const order of ordersData) {
        const numItems = faker.number.int({ min: 1, max: 5 });
        const selectedProducts = faker.helpers.arrayElements(products, numItems);
        let orderTotal = 0;

        for (const p of selectedProducts) {
            const qty = faker.number.int({ min: 1, max: 3 });
            const price = p.price;
            orderTotal += price * qty;
            
            orderItemsData.push({
                orderId: order.id,
                productId: p.id,
                quantity: qty,
                price: price,
            });
        }
        
        // Update order total (Prisma createMany doesn't support nested, and we can't update easily in bulk with different values without a loop or raw SQL)
        // For total, we'll just do single updates or live with 0 for now?
        // Actually, let's just do single updates for the total after createMany.
        updatedOrders.push(prisma.order.update({
            where: { id: order.id },
            data: { total: orderTotal }
        }));
    }
    
    await prisma.orderItem.createMany({ data: orderItemsData });
    
    console.log('--- Updating Order Totals ---');
    // Run updates in chunks to avoid overwhelming the connection
    const chunk = 50;
    for (let i = 0; i < updatedOrders.length; i += chunk) {
        await Promise.all(updatedOrders.slice(i, i + chunk));
    }

    console.log('--- Seeding Stock Logs ---');
    const stockLogsData = [];
    for (let i = 0; i < 1000; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const types = ['RESTOCK', 'SALE', 'MANUAL', 'RETURN', 'DAMAGED'];
        const type = faker.helpers.arrayElement(types);
        
        // Positive change for Restock and Return, negative for others
        const isPositive = type === 'RESTOCK' || type === 'RETURN';
        const change = isPositive 
            ? faker.number.int({ min: 20, max: 150 }) 
            : -faker.number.int({ min: 5, max: 30 });
        
        stockLogsData.push({
            productId: randomProduct.id,
            userId: randomUser.id,
            type,
            fromQty: randomProduct.stock,
            toQty: randomProduct.stock + change,
            change,
            reason: faker.lorem.sentence(),
            createdAt: faker.date.recent({ days: 30 }),
        });
    }
    await prisma.stockLog.createMany({ data: stockLogsData });

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