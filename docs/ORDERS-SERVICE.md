# Orders Service Documentation

## 📋 Overview

The Orders Service is a REST API microservice that handles order processing, tracking, and management. Unlike the Users and Products services which use GraphQL, this service implements a traditional REST API architecture.

**Port:** `3003`  
**Base URL:** `http://localhost:3003`  
**API Endpoint:** `http://localhost:3003/orders`  
**Type:** REST API

## 🎯 Key Features

- **Order Management** - Complete CRUD operations for orders
- **Multi-Item Orders** - Support for orders with multiple products
- **Order Status Tracking** - Track orders through their lifecycle
- **User Order Filtering** - Retrieve orders by user ID
- **Shipping Management** - Store and update shipping addresses
- **Total Calculation** - Automatic order total computation
- **In-Memory Storage** - Fast, volatile data store (development)
- **REST Architecture** - Standard HTTP methods and status codes

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│        Orders Service (Port 3003)                │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         REST API Controller                │ │
│  │  - GET /orders (all orders)                │ │
│  │  - GET /orders?userId=:id (filter)         │ │
│  │  - GET /orders/:id (single order)          │ │
│  │  - POST /orders (create)                   │ │
│  │  - PUT /orders/:id (update)                │ │
│  │  - DELETE /orders/:id (delete)             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Orders Service                     │ │
│  │  - Business logic                          │ │
│  │  - Order validation                        │ │
│  │  - Total calculation                       │ │
│  │  - Status management                       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         DTOs & Validation                  │ │
│  │  - CreateOrderDto                          │ │
│  │  - UpdateOrderDto                          │ │
│  │  - class-validator decorators              │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         In-Memory Storage                  │ │
│  │  - Orders map (id → Order)                 │ │
│  │  - Auto-incrementing IDs                   │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 📊 Data Model

### Order Entity

```typescript
class Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;  // Auto-calculated
  status: OrderStatus;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Item

```typescript
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
```

### Order Status Enum

```typescript
enum OrderStatus {
  PENDING = 'PENDING',       // Order created, awaiting processing
  PROCESSING = 'PROCESSING', // Order is being prepared
  SHIPPED = 'SHIPPED',       // Order has been shipped
  DELIVERED = 'DELIVERED',   // Order delivered to customer
  CANCELLED = 'CANCELLED'    // Order cancelled
}
```

### Default Orders

The service comes with a sample order:

```typescript
{
  id: '1',
  userId: '1',
  items: [
    { productId: '1', quantity: 2, price: 999.99 },
    { productId: '2', quantity: 1, price: 299.99 }
  ],
  totalAmount: 2299.97,
  status: 'PENDING',
  shippingAddress: '123 Main St, City, State 12345',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}
```

## 📡 API Reference

### Health Check

**Endpoint:** `GET http://localhost:3003/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

### Orders Endpoints

#### Get All Orders

**Endpoint:** `GET /orders`

**Description:** Retrieve all orders in the system

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "userId": "1",
    "items": [
      {
        "productId": "1",
        "quantity": 2,
        "price": 999.99
      },
      {
        "productId": "2",
        "quantity": 1,
        "price": 299.99
      }
    ],
    "totalAmount": 2299.97,
    "status": "PENDING",
    "shippingAddress": "123 Main St, City, State 12345",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Orders By User ID

**Endpoint:** `GET /orders?userId={userId}`

**Description:** Retrieve all orders for a specific user

**Query Parameters:**
- `userId` (string, required) - User ID to filter orders

**Example:** `GET /orders?userId=1`

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "userId": "1",
    "items": [...],
    "totalAmount": 2299.97,
    "status": "PENDING",
    "shippingAddress": "123 Main St, City, State 12345",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Order By ID

**Endpoint:** `GET /orders/:id`

**Description:** Retrieve a specific order by its ID

**Path Parameters:**
- `id` (string, required) - Order ID

**Example:** `GET /orders/1`

**Response:** `200 OK`
```json
{
  "id": "1",
  "userId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 999.99
    }
  ],
  "totalAmount": 1999.98,
  "status": "PENDING",
  "shippingAddress": "123 Main St, City, State 12345",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found",
  "error": "Not Found"
}
```

#### Create Order

**Endpoint:** `POST /orders`

**Description:** Create a new order

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 199.99
    },
    {
      "productId": "2",
      "quantity": 1,
      "price": 49.99
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345"
}
```

**Validation Rules:**
- `userId`: Required, must be a non-empty string
- `items`: Required, must be an array with at least one item
- `items[].productId`: Required, must be a non-empty string
- `items[].quantity`: Required, must be a number >= 1
- `items[].price`: Required, must be a number >= 0
- `shippingAddress`: Required, must be a non-empty string

**Response:** `201 Created`
```json
{
  "id": "2",
  "userId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 199.99
    },
    {
      "productId": "2",
      "quantity": 1,
      "price": 49.99
    }
  ],
  "totalAmount": 449.97,
  "status": "PENDING",
  "shippingAddress": "123 Main St, City, State 12345",
  "createdAt": "2024-02-05T10:30:00.000Z",
  "updatedAt": "2024-02-05T10:30:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": [
    "userId should not be empty",
    "items must be an array",
    "quantity must be at least 1"
  ],
  "error": "Bad Request"
}
```

#### Update Order

**Endpoint:** `PUT /orders/:id`

**Description:** Update order status or shipping address

**Path Parameters:**
- `id` (string, required) - Order ID

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (Update Status):**
```json
{
  "status": "PROCESSING"
}
```

**Request Body (Update Shipping Address):**
```json
{
  "shippingAddress": "456 Oak Ave, Town, State 67890"
}
```

**Request Body (Update Both):**
```json
{
  "status": "SHIPPED",
  "shippingAddress": "456 Oak Ave, Town, State 67890"
}
```

**Validation Rules:**
- `status`: Optional, must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- `shippingAddress`: Optional, must be a non-empty string if provided

**Response:** `200 OK`
```json
{
  "id": "1",
  "userId": "1",
  "items": [...],
  "totalAmount": 2299.97,
  "status": "PROCESSING",
  "shippingAddress": "456 Oak Ave, Town, State 67890",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-02-05T10:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found",
  "error": "Not Found"
}
```

#### Delete Order

**Endpoint:** `DELETE /orders/:id`

**Description:** Delete an order by ID

**Path Parameters:**
- `id` (string, required) - Order ID

**Response:** `204 No Content`

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found",
  "error": "Not Found"
}
```

## 🔄 Order Lifecycle

```
┌─────────┐    ┌────────────┐    ┌─────────┐    ┌───────────┐
│ PENDING │ -> │ PROCESSING │ -> │ SHIPPED │ -> │ DELIVERED │
└─────────┘    └────────────┘    └─────────┘    └───────────┘
     │
     └──────────> ┌───────────┐
                  │ CANCELLED │
                  └───────────┘
```

### Status Flow

1. **PENDING** - Order created, awaiting processing
2. **PROCESSING** - Order is being prepared for shipment
3. **SHIPPED** - Order has been dispatched to customer
4. **DELIVERED** - Order successfully delivered
5. **CANCELLED** - Order cancelled (can happen from PENDING or PROCESSING)

## 🛠️ Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3003

# Database Configuration (future)
# DATABASE_URL=postgresql://user:password@localhost:5432/orders
```

### Docker Configuration

**Dockerfile:** Multi-stage build for development and production

**Docker Compose:**
```yaml
orders-service:
  build: ./orders-service
  ports:
    - "3003:3003"
  environment:
    - NODE_ENV=development
    - PORT=3003
  networks:
    - microservices-network
```

## 🧪 Testing

### Using Postman

Import: `postman/Orders-Service.postman_collection.json`

**Test Flow:**
1. Get all orders
2. Create a new order
3. Get order by ID
4. Update order status
5. Update shipping address
6. Delete order

### Using cURL

**Get All Orders:**
```bash
curl http://localhost:3003/orders
```

**Get Orders By User:**
```bash
curl http://localhost:3003/orders?userId=1
```

**Get Order By ID:**
```bash
curl http://localhost:3003/orders/1
```

**Create Order:**
```bash
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "items": [
      {"productId": "1", "quantity": 2, "price": 199.99},
      {"productId": "2", "quantity": 1, "price": 49.99}
    ],
    "shippingAddress": "123 Main St, City, State 12345"
  }'
```

**Update Order Status:**
```bash
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}'
```

**Update Shipping Address:**
```bash
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress": "456 Oak Ave, Town, State 67890"}'
```

**Delete Order:**
```bash
curl -X DELETE http://localhost:3003/orders/1
```

### Via Federation Gateway

All endpoints are also accessible through the Gateway at `/api/orders`:

```bash
# Via Gateway
curl http://localhost:4000/api/orders

# Direct to service
curl http://localhost:3003/orders
```

## 📁 Project Structure

```
orders-service/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Main module
│   ├── orders/
│   │   ├── orders.module.ts         # Orders module
│   │   ├── orders.service.ts        # Business logic
│   │   ├── orders.controller.ts     # REST endpoints
│   │   ├── order.entity.ts          # Order entity & enums
│   │   └── dto/
│   │       ├── create-order.dto.ts  # Create order DTO
│   │       └── update-order.dto.ts  # Update order DTO
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Development

### Starting the Service

```bash
cd orders-service
npm install
npm run start:dev
```

### Running with Docker

```bash
docker-compose up orders-service
```

### Adding Validation

The service uses `class-validator` for DTO validation:

```typescript
// create-order.dto.ts
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
```

## 🔍 Common Use Cases

### Place an Order

**Use Case:** Customer checks out and creates an order

```bash
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "items": [
      {"productId": "1", "quantity": 1, "price": 999.99},
      {"productId": "3", "quantity": 2, "price": 79.99}
    ],
    "shippingAddress": "789 Pine Rd, Village, State 11223"
  }'
```

### Track Order Status

**Use Case:** Customer wants to check their order status

```bash
# Get specific order
curl http://localhost:3003/orders/1

# Get all orders for a user
curl http://localhost:3003/orders?userId=123
```

### Process Order

**Use Case:** Admin processes pending orders

```bash
# Change status to PROCESSING
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}'

# Mark as shipped
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "SHIPPED"}'

# Mark as delivered
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "DELIVERED"}'
```

### Update Shipping Address

**Use Case:** Customer needs to change delivery address

```bash
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress": "New Address, New City, State 99999"}'
```

### Cancel Order

**Use Case:** Customer wants to cancel their order

```bash
curl -X PUT http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED"}'
```

## 💡 Business Logic

### Total Calculation

The `totalAmount` is automatically calculated when creating an order:

```typescript
const totalAmount = items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
```

**Example:**
```
Item 1: $199.99 × 2 = $399.98
Item 2: $49.99 × 1 = $49.99
Total: $449.97
```

### Order Status Rules

- New orders start with `PENDING` status
- Status can be updated via PUT request
- No validation on status transitions (should be added in production)
- `updatedAt` timestamp is updated on any modification

### Shipping Address

- Required when creating an order
- Can be updated via PUT request
- No address validation (should add format checking in production)

## ⚠️ Important Notes

### In-Memory Storage

- **Data is volatile** - All orders are lost when service restarts
- **Not for production** - Use a real database (PostgreSQL, MongoDB, etc.)
- **No persistence** - Changes are not saved
- **Testing only** - Great for development and testing

### Missing Features (Production Needed)

1. **No Authentication** - Anyone can create/modify orders
2. **No Payment Processing** - Orders don't handle payments
3. **No Inventory Check** - Doesn't verify product stock
4. **No Email Notifications** - No order confirmation emails
5. **No Status Validation** - Can change status in any direction
6. **No Order History** - Can't track status change history
7. **No Refunds** - No refund or return functionality

### Data Validation

- Basic validation using `class-validator`
- No business rule validation (e.g., stock availability)
- No cross-service validation (e.g., user/product existence)
- Should add more robust validation in production

## 🚀 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Payment processing integration
- [ ] Inventory verification before order creation
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Order status history tracking
- [ ] Automatic status transitions
- [ ] Return and refund management
- [ ] Order cancellation policies
- [ ] Shipping carrier integration
- [ ] Order tracking numbers
- [ ] Multi-address support
- [ ] Gift orders and messages
- [ ] Order analytics and reporting
- [ ] Batch order processing
- [ ] Scheduled delivery options

## 📚 Related Documentation

- [Federation Gateway Documentation](./FEDERATION-GATEWAY.md)
- [Users Service Documentation](./USERS-SERVICE.md)
- [Products Service Documentation](./PRODUCTS-SERVICE.md)
- [NestJS Documentation](https://docs.nestjs.com/)

## 🤝 Best Practices

1. **Use the Gateway** for client requests in production
2. **Validate product stock** before accepting orders
3. **Implement authentication** for order operations
4. **Add payment processing** before production deployment
5. **Send order confirmations** via email
6. **Track status changes** in order history
7. **Implement proper error handling** and logging
8. **Add pagination** for order lists
9. **Use database transactions** for order creation
10. **Implement idempotency** for create operations

## 🔐 Security Considerations

### Production Requirements

1. **Authentication:** Verify user identity for all operations
2. **Authorization:** Ensure users can only access their own orders
3. **Input Validation:** Validate and sanitize all inputs
4. **Rate Limiting:** Prevent abuse and DoS attacks
5. **HTTPS Only:** Never send order data over HTTP
6. **PCI Compliance:** If handling payment data
7. **Data Encryption:** Encrypt sensitive order information
8. **Audit Logging:** Log all order operations

### Recommended Middleware

```typescript
// Add authentication guard
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController { ... }

// Add rate limiting
@UseGuards(ThrottlerGuard)
@Post()
createOrder() { ... }
```

## 📊 Performance Considerations

### Current Implementation
- **In-Memory:** Ultra-fast reads and writes
- **No Database Overhead:** Ideal for development
- **Limited Scale:** Works well for < 10,000 orders

### Production Recommendations
- **Use Database:** PostgreSQL with proper indexing
- **Add Caching:** Redis for frequently accessed orders
- **Implement Pagination:** Limit results per query
- **Add Search:** Elasticsearch for order search
- **Database Replication:** Read replicas for high traffic
- **Async Processing:** Queue system for order processing
- **Event Sourcing:** Track all order events
- **CQRS Pattern:** Separate read and write models

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check if port is in use
lsof -i :3003

# Check Docker logs
docker-compose logs orders-service
```

### Order Not Found

- Verify order ID is correct
- Check if service has been restarted (in-memory data lost)
- Ensure order was created successfully

### Validation Errors

- Check request body format
- Verify all required fields are present
- Ensure data types match expectations
- Review validation error messages

## 📈 Monitoring

### Metrics to Track

- Orders created per minute/hour
- Order status distribution
- Average order value
- Failed order creations
- API response times
- Error rates

### Health Monitoring

```bash
# Check service health
curl http://localhost:3003/health

# Via Gateway
curl http://localhost:4000/health/services
```
