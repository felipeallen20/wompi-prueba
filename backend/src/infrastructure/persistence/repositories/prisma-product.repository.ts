import { Product } from '../../../domain/entities/product.js';
import { Stock } from '../../../domain/entities/stock.js';
import type {
  ProductRepository,
  ProductWithStock,
} from '../../../domain/ports/product-repository.js';
import type {
  Product as PrismaProductModel,
  Stock as PrismaStockModel,
} from '../../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

type ProductWithStockRow = PrismaProductModel & {
  stock: PrismaStockModel | null;
};

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listWithStock(): Promise<ProductWithStock[]> {
    const rows = await this.prisma.product.findMany({
      include: { stock: true },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<ProductWithStock | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: { stock: true },
    });
    return row === null ? null : this.toDomain(row);
  }

  async findStockByProductId(productId: string): Promise<Stock | null> {
    const row = await this.prisma.stock.findUnique({
      where: { productId },
    });
    return row === null
      ? null
      : new Stock(row.productId, row.quantityAvailable);
  }

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const result = await this.prisma.stock.updateMany({
      where: {
        productId,
        quantityAvailable: { gte: quantity },
      },
      data: { quantityAvailable: { decrement: quantity } },
    });
    return result.count > 0;
  }

  private toDomain(row: ProductWithStockRow): ProductWithStock {
    const product = new Product(
      row.id,
      row.name,
      row.description,
      row.price,
      row.imageUrl,
    );
    const stock = new Stock(row.id, row.stock?.quantityAvailable ?? 0);
    return { ...product, stock };
  }
}
