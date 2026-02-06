import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Laptop',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      stock: 50,
      category: 'Electronics',
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      name: 'Smartphone',
      description: 'Latest smartphone with advanced features',
      price: 899.99,
      stock: 100,
      category: 'Electronics',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      name: 'Desk Chair',
      description: 'Ergonomic office chair',
      price: 299.99,
      stock: 30,
      category: 'Furniture',
      createdAt: new Date('2024-02-01'),
    },
    {
      id: '4',
      name: 'Wireless Mouse',
      description: 'Bluetooth wireless mouse',
      price: 29.99,
      stock: 200,
      category: 'Accessories',
      createdAt: new Date('2024-02-05'),
    },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  findByCategory(category: string): Product[] {
    return this.products.filter((product) => product.category === category);
  }

  create(
    name: string,
    description: string,
    price: number,
    stock: number,
    category: string,
  ): Product {
    const newProduct: Product = {
      id: String(this.products.length + 1),
      name,
      description,
      price,
      stock,
      category,
      createdAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateStock(id: string, quantity: number): Product | undefined {
    const product = this.findById(id);
    if (product) {
      product.stock = quantity;
      product.updatedAt = new Date();
    }
    return product;
  }
}
