import { Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  private orders: Order[] = [
    {
      id: '1',
      userId: '1',
      items: [
        { productId: '1', quantity: 1, price: 1299.99 },
        { productId: '4', quantity: 2, price: 29.99 },
      ],
      totalAmount: 1359.97,
      status: OrderStatus.DELIVERED,
      shippingAddress: '123 Main St, New York, NY 10001',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25'),
    },
    {
      id: '2',
      userId: '2',
      items: [{ productId: '2', quantity: 1, price: 899.99 }],
      totalAmount: 899.99,
      status: OrderStatus.SHIPPED,
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-03'),
    },
    {
      id: '3',
      userId: '1',
      items: [{ productId: '3', quantity: 1, price: 299.99 }],
      totalAmount: 299.99,
      status: OrderStatus.PROCESSING,
      shippingAddress: '123 Main St, New York, NY 10001',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05'),
    },
  ];

  findAll(): Order[] {
    return this.orders;
  }

  findById(id: string): Order {
    const order = this.orders.find((order) => order.id === id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  findByUserId(userId: string): Order[] {
    return this.orders.filter((order) => order.userId === userId);
  }

  create(createOrderDto: CreateOrderDto): Order {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const newOrder: Order = {
      id: String(this.orders.length + 1),
      userId: createOrderDto.userId,
      items: createOrderDto.items,
      totalAmount,
      status: OrderStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Order {
    const order = this.findById(id);

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    if (updateOrderDto.shippingAddress) {
      order.shippingAddress = updateOrderDto.shippingAddress;
    }

    order.updatedAt = new Date();
    return order;
  }

  delete(id: string): void {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    this.orders.splice(index, 1);
  }
}
