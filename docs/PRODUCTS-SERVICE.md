# Products Service Documentation

## 📋 Overview

The Products Service is a GraphQL subgraph that manages the product catalog and inventory. It's part of the Apollo Federation architecture and provides product-related functionality including catalog management, inventory tracking, and category filtering.

**Port:** `3002`  
**Base URL:** `http://localhost:3002`  
**GraphQL Endpoint:** `http://localhost:3002/graphql`  
**Type:** GraphQL Subgraph (Apollo Federation)

## 🎯 Key Features

- **Product Catalog** - Complete product listing with detailed information
- **Inventory Management** - Real-time stock tracking and updates
- **Category Filtering** - Organize and filter products by categories
- **Product CRUD** - Create, read, update, and delete products
- **Federation Support** - Entity resolution for cross-service queries
- **In-Memory Storage** - Fast, volatile data store (development)
- **Price Management** - Flexible pricing with decimal support

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│       Products Service (Port 3002)               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │      GraphQL API (Apollo Federation)       │ │
│  │  - ApolloFederationDriver                  │ │
│  │  - Schema with @key directives             │ │
│  │  - Entity resolution                       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Products Module                    │ │
│  │  - Product queries & mutations             │ │
│  │  - Product entity with @Directive('@key')  │ │
│  │  - @ResolveReference for federation        │ │
│  │  - Category filtering                      │ │
│  │  - Stock management                        │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Auth Module (Optional)             │ │
│  │  - JWT verification                        │ │
│  │  - Guards for protected mutations          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         In-Memory Storage                  │ │
│  │  - Products map (id → Product)             │ │
│  │  - Fast read/write operations              │ │
│  │  - Auto-incrementing IDs                   │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 📊 Data Model

### Product Entity

```typescript
@ObjectType()
@Directive('@key(fields: "id")')
class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  category: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
```

### Default Products

The service comes pre-loaded with sample products:

```typescript
[
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop for professionals',
    price: 999.99,
    stock: 10,
    category: 'Electronics',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Desk Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 299.99,
    stock: 25,
    category: 'Furniture',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 79.99,
    stock: 15,
    category: 'Home & Garden',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]
```

## 📡 API Reference

### Health Check

**Endpoint:** `GET http://localhost:3002/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

### GraphQL Schema

#### Types

**Product**
```graphql
type Product @key(fields: "id") {
  id: ID!
  name: String!
  description: String!
  price: Float!
  stock: Int!
  category: String!
  createdAt: DateTime!
  updatedAt: DateTime
}
```

### Queries

#### Get All Products
```graphql
query GetAllProducts {
  products {
    id
    name
    description
    price
    stock
    category
    createdAt
  }
}
```

**Response:**
```json
{
  "data": {
    "products": [
      {
        "id": "1",
        "name": "Laptop",
        "description": "High-performance laptop for professionals",
        "price": 999.99,
        "stock": 10,
        "category": "Electronics",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "2",
        "name": "Desk Chair",
        "description": "Ergonomic office chair with lumbar support",
        "price": 299.99,
        "stock": 25,
        "category": "Furniture",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get Product By ID
```graphql
query GetProduct($id: String!) {
  product(id: $id) {
    id
    name
    description
    price
    stock
    category
    createdAt
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

**Response:**
```json
{
  "data": {
    "product": {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop for professionals",
      "price": 999.99,
      "stock": 10,
      "category": "Electronics",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  }
}
```

#### Get Products By Category
```graphql
query GetProductsByCategory($category: String!) {
  productsByCategory(category: $category) {
    id
    name
    description
    price
    stock
    category
  }
}
```

**Variables:**
```json
{
  "category": "Electronics"
}
```

**Common Categories:**
- Electronics
- Furniture
- Home & Garden
- Clothing
- Books
- Sports & Outdoors

### Mutations

#### Create Product
**May require authentication via Gateway**

```graphql
mutation CreateProduct(
  $name: String!
  $description: String!
  $price: Float!
  $stock: Int!
  $category: String!
) {
  createProduct(
    name: $name
    description: $description
    price: $price
    stock: $stock
    category: $category
  ) {
    id
    name
    description
    price
    stock
    category
    createdAt
  }
}
```

**Variables:**
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with active noise cancellation",
  "price": 199.99,
  "stock": 50,
  "category": "Electronics"
}
```

**Response:**
```json
{
  "data": {
    "createProduct": {
      "id": "4",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with active noise cancellation",
      "price": 199.99,
      "stock": 50,
      "category": "Electronics",
      "createdAt": "2024-02-05T10:30:00.000Z"
    }
  }
}
```

#### Update Product Stock
**May require authentication via Gateway**

```graphql
mutation UpdateProductStock($id: String!, $quantity: Int!) {
  updateProductStock(id: $id, quantity: $quantity) {
    id
    name
    stock
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "1",
  "quantity": 100
}
```

**Response:**
```json
{
  "data": {
    "updateProductStock": {
      "id": "1",
      "name": "Laptop",
      "stock": 100,
      "updatedAt": "2024-02-05T10:30:00.000Z"
    }
  }
}
```

**Note:** The quantity parameter sets the stock to an absolute value (not incremental).

## 🔄 Federation Support

### Entity Key

The Product entity is marked with `@key(fields: "id")` directive, making it a federated entity:

```graphql
type Product @key(fields: "id") {
  id: ID!
  # ... other fields
}
```

### Reference Resolution

Other services can reference Product entities:

```typescript
@ResolveReference()
resolveReference(reference: { __typename: string; id: string }) {
  return this.productsService.findById(reference.id);
}
```

**Example Usage in Other Services:**
```graphql
# In Orders Service
type OrderItem {
  productId: String!
  product: Product  # References Products Service
  quantity: Int!
  price: Float!
}
```

### Federation Introspection

Query the service's SDL:

```graphql
{
  _service {
    sdl
  }
}
```

**Response:**
```json
{
  "data": {
    "_service": {
      "sdl": "type Product @key(fields: \"id\") { id: ID! name: String! ... }"
    }
  }
}
```

## 🛠️ Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3002

# JWT Configuration (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Configuration (future)
# DATABASE_URL=postgresql://user:password@localhost:5432/products
```

### Docker Configuration

**Dockerfile:** Multi-stage build for development and production

**Docker Compose:**
```yaml
products-service:
  build: ./products-service
  ports:
    - "3002:3002"
  environment:
    - NODE_ENV=development
    - PORT=3002
    - JWT_SECRET=your-super-secret-jwt-key-change-in-production
  networks:
    - microservices-network
```

## 🧪 Testing

### Using Postman

Import: `postman/Products-Service.postman_collection.json`

**Test Flow:**
1. Get all products
2. Get product by ID
3. Filter products by category
4. Create a new product
5. Update product stock

### Using GraphQL Playground

1. Navigate to `http://localhost:3002/graphql`
2. Explore the schema using the Docs panel
3. Run queries and mutations
4. Test federation features

### Using cURL

**Get All Products:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products { id name price stock category } }"}'
```

**Get Product By ID:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetProduct($id: String!) { product(id: $id) { id name price stock } }",
    "variables": {"id": "1"}
  }'
```

**Get Products By Category:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetProductsByCategory($category: String!) { productsByCategory(category: $category) { id name price } }",
    "variables": {"category": "Electronics"}
  }'
```

**Create Product:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateProduct($name: String!, $description: String!, $price: Float!, $stock: Int!, $category: String!) { createProduct(name: $name, description: $description, price: $price, stock: $stock, category: $category) { id name price } }",
    "variables": {
      "name": "Smartphone",
      "description": "Latest smartphone with 5G",
      "price": 799.99,
      "stock": 30,
      "category": "Electronics"
    }
  }'
```

**Update Stock:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation UpdateProductStock($id: String!, $quantity: Int!) { updateProductStock(id: $id, quantity: $quantity) { id name stock } }",
    "variables": {"id": "1", "quantity": 150}
  }'
```

## 📁 Project Structure

```
products-service/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Main module with GraphQL config
│   ├── products/
│   │   ├── products.module.ts       # Products module
│   │   ├── products.service.ts      # Product business logic
│   │   ├── products.resolver.ts     # Product queries/mutations
│   │   └── product.entity.ts        # Product GraphQL type
│   ├── auth/ (optional)
│   │   ├── auth.module.ts           # Authentication module
│   │   ├── auth.service.ts          # JWT verification
│   │   ├── guards/
│   │   │   └── gql-auth.guard.ts    # GraphQL auth guard
│   │   └── decorators/
│   │       ├── auth.decorator.ts
│   │       └── current-user.decorator.ts
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
cd products-service
npm install
npm run start:dev
```

### Running with Docker

```bash
docker-compose up products-service
```

### Adding New Products

Products are stored in-memory. To add default products, modify the service initialization:

```typescript
// products.service.ts
private products = new Map<string, Product>([
  ['1', { id: '1', name: 'Product 1', ... }],
  ['2', { id: '2', name: 'Product 2', ... }],
  // Add more here
]);
```

## 🔍 Common Use Cases

### Browsing Product Catalog

**Use Case:** Display all available products to customers

```graphql
query BrowseCatalog {
  products {
    id
    name
    description
    price
    stock
    category
  }
}
```

### Category Navigation

**Use Case:** Show products in a specific category

```graphql
query ElectronicsProducts {
  productsByCategory(category: "Electronics") {
    id
    name
    price
    stock
  }
}
```

### Product Details Page

**Use Case:** Show detailed information for a single product

```graphql
query ProductDetails($id: String!) {
  product(id: $id) {
    id
    name
    description
    price
    stock
    category
    createdAt
  }
}
```

### Inventory Management

**Use Case:** Update stock levels after receiving new inventory

```graphql
mutation RestockProduct($id: String!, $quantity: Int!) {
  updateProductStock(id: $id, quantity: $quantity) {
    id
    name
    stock
    updatedAt
  }
}
```

### Adding New Products

**Use Case:** Admin adds a new product to the catalog

```graphql
mutation AddNewProduct(
  $name: String!
  $description: String!
  $price: Float!
  $stock: Int!
  $category: String!
) {
  createProduct(
    name: $name
    description: $description
    price: $price
    stock: $stock
    category: $category
  ) {
    id
    name
    price
    stock
    category
  }
}
```

## 💡 Business Logic

### Stock Management

- **Absolute Values:** `updateProductStock` sets stock to the exact quantity provided
- **No Negative Stock:** Service allows negative stock (should be validated in production)
- **Concurrency:** In-memory storage doesn't handle concurrent updates (use database with transactions)

### Pricing

- **Float Type:** Supports decimal prices (e.g., 19.99)
- **Currency:** No currency field (USD assumed, should be added in production)
- **Price Updates:** Currently requires creating a new mutation (should be implemented)

### Categories

- **Free Text:** Categories are plain strings
- **No Validation:** Any category name is accepted
- **Case Sensitive:** "Electronics" ≠ "electronics"
- **Production:** Should use an enum or separate Category entity

## ⚠️ Important Notes

### In-Memory Storage

- **Data is volatile** - All data is lost when service restarts
- **Not for production** - Use a real database (PostgreSQL, MongoDB, etc.)
- **No persistence** - Changes are not saved
- **Testing only** - Great for development and testing

### Authentication

- **Gateway handles auth** - This service relies on the gateway for authentication
- **Optional guards** - Auth guards can be added to mutations
- **Direct access** - No authentication when accessing service directly (port 3002)

### Stock Management

- **No order integration** - Stock doesn't automatically decrease when orders are placed
- **Manual updates** - Stock must be updated manually via mutation
- **Production needs** - Implement automatic stock adjustment and reorder alerts

## 🚀 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Product images and media
- [ ] Advanced search and filtering
- [ ] Price history tracking
- [ ] Product reviews and ratings
- [ ] Inventory alerts (low stock)
- [ ] Automatic stock adjustment on orders
- [ ] Product variants (size, color, etc.)
- [ ] Bulk import/export
- [ ] Product categories as separate entity
- [ ] Price discount and promotion support
- [ ] Related products recommendations
- [ ] Product availability by location

## 📚 Related Documentation

- [Federation Gateway Documentation](./FEDERATION-GATEWAY.md)
- [Users Service Documentation](./USERS-SERVICE.md)
- [Orders Service Documentation](./ORDERS-SERVICE.md)
- [Apollo Federation Docs](https://www.apollographql.com/docs/federation/)

## 🤝 Best Practices

1. **Use the Gateway** for client requests in production
2. **Validate stock levels** before accepting orders
3. **Implement proper authentication** for mutations
4. **Use database transactions** for stock updates
5. **Add input validation** for prices and quantities
6. **Implement pagination** for large product catalogs
7. **Cache frequently accessed products** for better performance
8. **Monitor inventory levels** and set up alerts
9. **Use enums for categories** to ensure consistency
10. **Add product search** functionality for better UX

## 📊 Performance Considerations

### Current Implementation
- **In-Memory:** Ultra-fast reads and writes
- **No Database Overhead:** Ideal for development
- **Limited Scale:** Works well for < 10,000 products

### Production Recommendations
- **Use Database:** PostgreSQL with proper indexing
- **Add Caching:** Redis for frequently accessed products
- **Implement Pagination:** Limit results per query
- **Add Search:** Elasticsearch for advanced search
- **CDN for Images:** Store product images in CDN
- **Database Replication:** Read replicas for high traffic
