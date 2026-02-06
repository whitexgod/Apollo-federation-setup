# Microservices Architecture with Apollo Federation

This project demonstrates a microservices architecture using **Apollo Federation** for GraphQL services and REST API integration.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Federation Gateway (Port 4000)            │
│                    Apollo Supergraph Gateway                │
│  - Combines multiple GraphQL subgraphs                      │
│  - Provides unified GraphQL API                             │
│  - Proxies REST API requests                                │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Users Service │    │Products Svc  │    │Orders Service│
│  (Port 3001) │    │  (Port 3002) │    │  (Port 3003) │
│              │    │              │    │              │
│GraphQL       │    │GraphQL       │    │REST API      │
│Subgraph      │    │Subgraph      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Services

### 1. Federation Gateway (Port 4000)
- **Type**: Apollo Federation Supergraph Gateway
- **Technology**: NestJS + Apollo Gateway
- **Purpose**: 
  - Aggregates GraphQL subgraphs (users-service & products-service)
  - Provides unified GraphQL endpoint
  - Proxies REST API requests to orders-service
  
### 2. Users Service (Port 3001)
- **Type**: GraphQL Subgraph
- **Technology**: NestJS + Apollo Federation
- **Features**:
  - User management (CRUD operations)
  - Federated entity with `@key(fields: "id")`
  - Queries: `users`, `user(id)`, `userByEmail(email)`
  - Mutations: `createUser(name, email, role)`

### 3. Products Service (Port 3002)
- **Type**: GraphQL Subgraph
- **Technology**: NestJS + Apollo Federation
- **Features**:
  - Product catalog management
  - Federated entity with `@key(fields: "id")`
  - Queries: `products`, `product(id)`, `productsByCategory(category)`
  - Mutations: `createProduct(...)`, `updateProductStock(id, quantity)`

### 4. Orders Service (Port 3003)
- **Type**: REST API
- **Technology**: NestJS REST Controller
- **Features**:
  - Order management
  - RESTful endpoints
  - Endpoints: 
    - `GET /orders` - Get all orders (optional ?userId filter)
    - `GET /orders/:id` - Get order by ID
    - `POST /orders` - Create new order
    - `PUT /orders/:id` - Update order
    - `DELETE /orders/:id` - Delete order

## Project Structure

```
.
├── federation-gateway/          # Apollo Federation Gateway (Supergraph)
│   ├── src/
│   │   ├── app.module.ts       # Main module with Federation config
│   │   ├── main.ts
│   │   ├── auth/               # JWT authentication
│   │   ├── config/             # Configuration service
│   │   ├── health/             # Health check endpoint
│   │   └── proxy/              # REST API proxy controllers
│   ├── Dockerfile
│   └── package.json
│
├── users-service/              # Users GraphQL Subgraph
│   ├── src/
│   │   ├── users/
│   │   │   ├── user.entity.ts       # User entity with @Directive('@key(fields: "id")')
│   │   │   ├── users.resolver.ts    # GraphQL resolver with @ResolveReference
│   │   │   └── users.service.ts
│   │   └── app.module.ts           # ApolloFederationDriver config
│   ├── Dockerfile
│   └── package.json
│
├── products-service/           # Products GraphQL Subgraph
│   ├── src/
│   │   ├── products/
│   │   │   ├── product.entity.ts    # Product entity with @Directive('@key(fields: "id")')
│   │   │   ├── products.resolver.ts # GraphQL resolver with @ResolveReference
│   │   │   └── products.service.ts
│   │   └── app.module.ts           # ApolloFederationDriver config
│   ├── Dockerfile
│   └── package.json
│
├── orders-service/             # Orders REST API
│   ├── src/
│   │   ├── orders/
│   │   │   ├── order.entity.ts
│   │   │   ├── orders.controller.ts # REST controller
│   │   │   ├── orders.service.ts
│   │   │   └── dto/                # DTOs for validation
│   │   └── app.module.ts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Orchestrates all services
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the services**
   - Federation Gateway GraphQL Playground: http://localhost:4000/graphql
   - Users Service GraphQL Playground: http://localhost:3001/graphql
   - Products Service GraphQL Playground: http://localhost:3002/graphql
   - Orders Service REST API: http://localhost:3003/orders
   - Health checks: 
     - http://localhost:4000/health
     - http://localhost:3001/health
     - http://localhost:3002/health
     - http://localhost:3003/health

### Local Development (Without Docker)

1. **Install dependencies for each service**
   ```bash
   # Federation Gateway
   cd federation-gateway && npm install && cd ..
   
   # Users Service
   cd users-service && npm install && cd ..
   
   # Products Service
   cd products-service && npm install && cd ..
   
   # Orders Service
   cd orders-service && npm install && cd ..
   ```

2. **Start each service in separate terminals**
   ```bash
   # Terminal 1 - Users Service
   cd users-service && npm run start:dev
   
   # Terminal 2 - Products Service
   cd products-service && npm run start:dev
   
   # Terminal 3 - Orders Service
   cd orders-service && npm run start:dev
   
   # Terminal 4 - Federation Gateway
   cd federation-gateway && npm run start:dev
   ```

## Testing the Federation

### GraphQL Queries (via Federation Gateway at http://localhost:4000/graphql)

#### Query Users
```graphql
query {
  users {
    id
    name
    email
    role
    createdAt
  }
}
```

#### Query Products
```graphql
query {
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

#### Query Specific User
```graphql
query {
  user(id: "1") {
    id
    name
    email
    role
  }
}
```

#### Create User Mutation
```graphql
mutation {
  createUser(
    name: "Alice Johnson"
    email: "alice@example.com"
    role: "user"
  ) {
    id
    name
    email
    role
  }
}
```

#### Create Product Mutation
```graphql
mutation {
  createProduct(
    name: "Mechanical Keyboard"
    description: "RGB mechanical gaming keyboard"
    price: 149.99
    stock: 75
    category: "Accessories"
  ) {
    id
    name
    price
    stock
  }
}
```

### REST API Calls (Orders Service via Gateway)

#### Get All Orders
```bash
curl http://localhost:4000/api/orders
```

#### Get Orders by User
```bash
curl http://localhost:4000/api/orders?userId=1
```

#### Get Order by ID
```bash
curl http://localhost:4000/api/orders/1
```

#### Create Order
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "items": [
      {"productId": "1", "quantity": 1, "price": 1299.99}
    ],
    "shippingAddress": "123 Main St, New York, NY 10001"
  }'
```

#### Update Order Status
```bash
curl -X PUT http://localhost:4000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED"
  }'
```

#### Delete Order
```bash
curl -X DELETE http://localhost:4000/api/orders/1
```

## Direct Service Access

You can also access services directly (bypassing the gateway):

- **Users Service**: http://localhost:3001/graphql
- **Products Service**: http://localhost:3002/graphql
- **Orders Service**: http://localhost:3003/orders

## Key Features

### Apollo Federation
- **Subgraph Composition**: Multiple GraphQL services compose into a single unified graph
- **Entity References**: Entities can be referenced across subgraphs using `@key` directive
- **Type Extension**: Types can be extended across services
- **Automatic Schema Composition**: Gateway automatically composes the supergraph schema

### Service Independence
- Each service has its own codebase, Dockerfile, and can be deployed independently
- Services communicate through well-defined GraphQL or REST interfaces
- Easy to scale individual services based on load

### Development Features
- Hot reload enabled for all services during development
- Health check endpoints for monitoring
- CORS enabled for frontend integration
- Validation pipes for data integrity

## Environment Variables

### Federation Gateway
```env
PORT=4000
NODE_ENV=development
USERS_SERVICE_URL=http://users-service:3001/graphql
PRODUCTS_SERVICE_URL=http://products-service:3002/graphql
ORDERS_SERVICE_URL=http://orders-service:3003
APOLLO_PLAYGROUND=true
APOLLO_INTROSPECTION=true
```

### Individual Services
```env
PORT=<service-port>
NODE_ENV=development
```

## Production Deployment

To run in production mode:

```bash
docker-compose -f docker-compose.yml up --build -d
```

Or build production images:

```bash
# Build production images
docker build -t federation-gateway:prod --target production ./federation-gateway
docker build -t users-service:prod --target production ./users-service
docker build -t products-service:prod --target production ./products-service
docker build -t orders-service:prod --target production ./orders-service
```

## Troubleshooting

### Services not connecting
- Ensure all services are running: `docker-compose ps`
- Check logs: `docker-compose logs -f <service-name>`
- Verify network connectivity: `docker network inspect <network-name>`

### Gateway can't find subgraphs
- Verify service URLs in environment variables
- Ensure subgraph services are healthy
- Check that services are on the same Docker network

### Port conflicts
- Change exposed ports in docker-compose.yml if ports are already in use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
