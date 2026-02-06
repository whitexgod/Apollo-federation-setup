# Federation Gateway Documentation

## 📋 Overview

The Federation Gateway is the unified entry point for the entire microservices architecture. It combines multiple GraphQL subgraphs using Apollo Federation and proxies REST API requests to various backend services.

**Port:** `4000`  
**Base URL:** `http://localhost:4000`  
**GraphQL Playground:** `http://localhost:4000/graphql`

## 🎯 Key Features

- **Unified GraphQL API** - Combines Users and Products subgraphs into a single schema
- **REST API Proxy** - Forwards requests to Orders, Auth, and Media services
- **Authentication** - JWT-based authentication and authorization
- **Health Monitoring** - Tracks health status of all connected services
- **CORS Support** - Configurable cross-origin resource sharing
- **Logging & Monitoring** - Request/response logging and error tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│          Federation Gateway (Port 4000)             │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │        Apollo Federation Gateway             │  │
│  │  - IntrospectAndCompose                      │  │
│  │  - Schema Stitching                          │  │
│  │  - Cross-service References                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           REST API Proxies                   │  │
│  │  - /api/orders  → Orders Service (3003)      │  │
│  │  - /api/auth    → Auth Service (External)    │  │
│  │  - /api/media   → Media Service (External)   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         Middleware & Guards                  │  │
│  │  - JWT Authentication                        │  │
│  │  - Request Logging                           │  │
│  │  - Exception Filtering                       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
            │                    │
    ┌───────┴────────┐    ┌─────┴──────┐
    │  Users Service │    │  Products  │
    │  GraphQL       │    │  Service   │
    │  Port 3001     │    │  GraphQL   │
    └────────────────┘    │  Port 3002 │
                          └────────────┘
```

## 📡 Endpoints

### GraphQL Endpoint

**URL:** `POST http://localhost:4000/graphql`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>  # Optional, for protected queries
```

**Features:**
- Interactive GraphQL Playground (development mode)
- Schema introspection
- Federated queries across Users and Products services
- Real-time error reporting

### Health Check Endpoints

#### Overall Health
```
GET http://localhost:4000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-05T10:30:00.000Z",
  "gateway": {
    "uptime": 3600000,
    "memory": {
      "rss": 50000000,
      "heapTotal": 30000000,
      "heapUsed": 20000000,
      "external": 1000000
    }
  },
  "services": [
    {
      "name": "Users Service",
      "url": "http://users-service:3001/graphql",
      "status": "healthy",
      "responseTime": 45
    },
    {
      "name": "Products Service",
      "url": "http://products-service:3002/graphql",
      "status": "healthy",
      "responseTime": 38
    },
    {
      "name": "Orders Service",
      "url": "http://orders-service:3003/health",
      "status": "healthy",
      "responseTime": 22
    }
  ]
}
```

#### Services Health Only
```
GET http://localhost:4000/health/services
```

Returns only the array of service health statuses.

### REST API Proxy Endpoints

#### Orders API Proxy
All requests to `/api/orders/*` are forwarded to the Orders Service.

**Base Path:** `http://localhost:4000/api/orders`

**Examples:**
- `GET /api/orders` → Get all orders
- `GET /api/orders/:id` → Get order by ID
- `POST /api/orders` → Create order
- `PUT /api/orders/:id` → Update order
- `DELETE /api/orders/:id` → Delete order

**See:** [Orders Service Documentation](./ORDERS-SERVICE.md) for detailed API specs.

#### Auth API Proxy
Forwards authentication requests to external Auth Service.

**Base Path:** `http://localhost:4000/api/auth`

**Features:**
- Profile picture upload (`/api/auth/profile-picture/*`)
- Google OAuth (`/api/auth/google/*`)
- Custom authentication flows

#### Media API Proxy
Forwards media requests to external Media Service.

**Base Path:** `http://localhost:4000/api/media`

## 🔐 Authentication

The gateway supports JWT-based authentication using RS256 (RSA with SHA-256).

### Public Key Configuration

The gateway uses a public key to verify JWT tokens signed by the Users Service.

**Configuration:**
```env
USE_JWKS=true
JWT_PUBLIC_KEY=<base64-encoded-public-key>
```

**Key Location:** `/federation-gateway/keys/jwtRS256.key.pub`

### Protected Queries

Some GraphQL queries require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authentication Flow

1. User authenticates via Users Service (login/register mutation)
2. Users Service returns JWT access token
3. Client includes token in subsequent requests
4. Gateway validates token using public key
5. User context is passed to resolvers

**Example:**
```graphql
# 1. Login to get token
mutation {
  login(input: { email: "user@example.com", password: "pass123" }) {
    accessToken
    user { id name }
  }
}

# 2. Use token for protected queries
# Header: Authorization: Bearer <accessToken>
query {
  me {
    id
    name
    email
    role
  }
}
```

## 🔄 GraphQL Federation

### Federated Schema

The gateway automatically composes schemas from:
- **Users Service** (`http://users-service:3001/graphql`)
- **Products Service** (`http://products-service:3002/graphql`)

### Schema Composition

Using Apollo's `IntrospectAndCompose`:

```typescript
ApolloGatewayDriver.forRoot({
  gateway: {
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'users', url: 'http://users-service:3001/graphql' },
        { name: 'products', url: 'http://products-service:3002/graphql' }
      ]
    })
  }
})
```

### Cross-Service Queries

The gateway enables queries that span multiple services:

```graphql
# Query users and products in a single request
query {
  users {
    id
    name
    email
  }
  products {
    id
    name
    price
  }
}
```

### Entity Resolution

Federation allows services to reference entities from other services:

```graphql
# Future: Extend User entity with orders
type User @key(fields: "id") {
  id: ID!
  name: String!
  orders: [Order!]!  # Resolved from Orders Service
}
```

## 📊 Available GraphQL Operations

### Queries

#### Users
- `users` - Get all users
- `user(id: String!)` - Get user by ID
- `userByEmail(email: String!)` - Get user by email
- `me` - Get current authenticated user (requires auth)

#### Products
- `products` - Get all products
- `product(id: String!)` - Get product by ID
- `productsByCategory(category: String!)` - Get products by category

### Mutations

#### Authentication
- `login(input: LoginInput!)` - Login user
- `register(input: RegisterInput!)` - Register new user

#### Users
- `createUser(name: String!, email: String!, role: String)` - Create user

#### Products
- `createProduct(name: String!, description: String!, price: Float!, stock: Int!, category: String!)` - Create product
- `updateProductStock(id: String!, quantity: Int!)` - Update product stock

## 🛠️ Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Authentication
USE_JWKS=true
JWT_PUBLIC_KEY=<base64-encoded-public-key>

# Service URLs
USERS_SERVICE_URL=http://users-service:3001/graphql
PRODUCTS_SERVICE_URL=http://products-service:3002/graphql
ORDERS_SERVICE_URL=http://orders-service:3003

# External Service URLs (Optional)
AUTH_REST_SERVICE_URL=http://auth-service:3000
MEDIA_SERVICE_URL=http://media-service:3001

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# Logging
LOG_LEVEL=debug

# Apollo Configuration
APOLLO_PLAYGROUND=true
APOLLO_INTROSPECTION=true
```

### Docker Configuration

**Dockerfile:** Multi-stage build with development and production targets

**Docker Compose:**
```yaml
federation-gateway:
  build: ./federation-gateway
  ports:
    - "4000:4000"
  depends_on:
    - users-service
    - products-service
    - orders-service
  networks:
    - microservices-network
```

## 🧪 Testing

### Using Postman

Import: `postman/Federation-Gateway.postman_collection.json`

**Collection includes:**
- Health check requests
- GraphQL queries and mutations
- REST proxy requests
- Authentication flows

### Using GraphQL Playground

1. Navigate to `http://localhost:4000/graphql`
2. Explore the schema using the Docs panel
3. Run queries and mutations interactively
4. Add Authorization header for protected operations

### Using cURL

**Health Check:**
```bash
curl http://localhost:4000/health
```

**GraphQL Query:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ products { id name price } }"
  }'
```

**REST Proxy:**
```bash
curl http://localhost:4000/api/orders
```

## 🔍 Monitoring & Logging

### Logging Interceptor

All requests are logged with:
- Request method and URL
- Response status code
- Response time
- User context (if authenticated)

**Log Format:**
```
[Gateway] POST /graphql 200 - 45ms
[Gateway] GET /api/orders 200 - 22ms
```

### Health Monitoring

The health service continuously monitors:
- Gateway uptime
- Memory usage
- Service connectivity
- Response times

### Error Handling

Errors are caught and formatted consistently:

```json
{
  "statusCode": 500,
  "message": "Service unavailable",
  "error": "Internal Server Error",
  "timestamp": "2024-02-05T10:30:00.000Z",
  "path": "/graphql"
}
```

## 🚀 Development

### Starting the Gateway

```bash
cd federation-gateway
npm install
npm run start:dev
```

### Running with Docker

```bash
docker-compose up federation-gateway
```

### Generating Super Schema

Generate the composed federated schema:

```bash
cd federation-gateway
npm run generate-schema
```

## 📁 Project Structure

```
federation-gateway/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Main module with federation config
│   ├── config/                    # Configuration service
│   ├── auth/                      # JWT authentication
│   │   ├── guards/                # Auth guards
│   │   ├── strategies/            # JWT strategy
│   │   └── decorators/            # Custom decorators
│   ├── health/                    # Health check endpoints
│   ├── proxy/                     # REST API proxy controllers
│   │   ├── orders-proxy.controller.ts
│   │   ├── auth-proxy.controller.ts
│   │   ├── media-proxy.controller.ts
│   │   └── proxy.service.ts
│   └── common/                    # Shared utilities
│       ├── filters/               # Exception filters
│       ├── interceptors/          # Request/response interceptors
│       └── middleware/            # Custom middleware
├── keys/                          # JWT public keys
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Troubleshooting

### Gateway Won't Start

**Check service URLs:**
```bash
docker-compose logs federation-gateway
```

**Verify services are running:**
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### GraphQL Errors

**Check subgraph health:**
```bash
curl http://localhost:4000/health/services
```

**Verify schema composition:**
- Check logs for schema composition errors
- Ensure subgraphs are accessible
- Verify `@key` directives on entities

### Authentication Issues

**Verify JWT public key:**
- Check `JWT_PUBLIC_KEY` environment variable
- Ensure key file exists: `keys/jwtRS256.key.pub`
- Verify key format (PEM)

**Test token:**
```bash
# Decode JWT token (without verification)
echo "<token>" | cut -d. -f2 | base64 -d | jq
```

## 📚 Related Documentation

- [Users Service Documentation](./USERS-SERVICE.md)
- [Products Service Documentation](./PRODUCTS-SERVICE.md)
- [Orders Service Documentation](./ORDERS-SERVICE.md)
- [Apollo Federation Docs](https://www.apollographql.com/docs/federation/)

## 🤝 Best Practices

1. **Always use the Gateway for client requests** - Don't access subgraphs directly in production
2. **Include Authorization header** for protected operations
3. **Monitor health endpoints** regularly
4. **Use GraphQL Playground** for schema exploration
5. **Check logs** when debugging issues
6. **Configure CORS** appropriately for your frontend
7. **Use environment variables** for configuration
8. **Keep JWT public key secure** and updated

## 🆕 Future Enhancements

- [ ] Rate limiting
- [ ] Request caching
- [ ] GraphQL subscriptions
- [ ] Distributed tracing
- [ ] Advanced monitoring with Prometheus/Grafana
- [ ] API versioning
- [ ] Request batching
- [ ] Persisted queries
