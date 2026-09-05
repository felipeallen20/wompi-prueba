import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

interface ProductSeed {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priceInMinorUnits: number;
  readonly imageUrl: string;
  readonly quantityAvailable: number;
}

const PRODUCTS: readonly ProductSeed[] = [
  {
    id: 'product-wireless-mouse',
    name: 'Wireless Mouse',
    description: 'A comfortable wireless mouse with quiet clicks.',
    priceInMinorUnits: 45000,
    imageUrl: 'https://placehold.co/400x400?text=Wireless+Mouse',
    quantityAvailable: 12,
  },
  {
    id: 'product-mechanical-keyboard',
    name: 'Mechanical Keyboard',
    description: 'Tactile mechanical keyboard with backlit keys.',
    priceInMinorUnits: 220000,
    imageUrl: 'https://placehold.co/400x400?text=Mechanical+Keyboard',
    quantityAvailable: 8,
  },
  {
    id: 'product-monitor',
    name: '27-inch Monitor',
    description: 'Full HD IPS monitor with slim bezels.',
    priceInMinorUnits: 780000,
    imageUrl: 'https://placehold.co/400x400?text=Monitor',
    quantityAvailable: 5,
  },
  {
    id: 'product-headset',
    name: 'Noise-Cancelling Headset',
    description: 'Over-ear headset with active noise cancellation.',
    priceInMinorUnits: 350000,
    imageUrl: 'https://placehold.co/400x400?text=Headset',
    quantityAvailable: 10,
  },
  {
    id: 'product-webcam',
    name: '1080p Webcam',
    description: 'Full HD webcam for video calls and streaming.',
    priceInMinorUnits: 140000,
    imageUrl: 'https://placehold.co/400x400?text=Webcam',
    quantityAvailable: 15,
  },
];

export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main(): Promise<void> {
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.priceInMinorUnits,
        imageUrl: product.imageUrl,
        stock: {
          create: { quantityAvailable: product.quantityAvailable },
        },
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.priceInMinorUnits,
        imageUrl: product.imageUrl,
        stock: {
          upsert: {
            create: { quantityAvailable: product.quantityAvailable },
            update: { quantityAvailable: product.quantityAvailable },
          },
        },
      },
    });
    console.info(`Seeded product ${product.id}`);
  }

  const total = await prisma.product.count();
  console.info(`Seed complete: ${total} products with stock.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });