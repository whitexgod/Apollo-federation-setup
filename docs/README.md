# API Documentation

Welcome to the Microservices Architecture API Documentation. This documentation provides comprehensive information about all services in the system.

## 📚 Documentation Index

This folder contains detailed documentation for each service in the microservices architecture:

### Service Documentation
1. **[Federation Gateway](./FEDERATION-GATEWAY.md)** - Unified API Gateway
2. **[Users Service](./USERS-SERVICE.md)** - User Management & Authentication
3. **[Products Service](./PRODUCTS-SERVICE.md)** - Product Catalog Management
4. **[Orders Service](./ORDERS-SERVICE.md)** - Order Processing & Tracking

### Setup & Configuration
5. **[MongoDB Setup Guide](./MONGODB-SETUP.md)** - Database configuration and management
6. **[Authentication Guide](./AUTHENTICATION-GUIDE.md)** - JWT authentication for GraphQL endpoints

## 🗂️ Postman Collections

Postman collections for testing all services are available in the `/postman` folder:

- `Federation-Gateway.postman_collection.json` - Complete gateway API
- `Users-Service.postman_collection.json` - Direct users service access
- `Products-Service.postman_collection.json` - Direct products service access
- `Orders-Service.postman_collection.json` - Direct orders service access

### Importing Collections

1. Open Postman
2. Click **Import** button
3. Select the collection JSON file(s)
4. Update environment variables as needed

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Federation Gateway (Port 4000)         │
│                                                     │
│  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │  GraphQL Gateway │  │   REST API Proxies      │ │
│  │  (Apollo)        │  │   - Auth                │ │
│  │                  │  │   - Media               │ │
│  └──────────────────┘  │   - Orders              │ │
│           │            └─────────────────────────┘ │
└───────────┼──────────────────────────────────────────┘
            │
    ┌───────┴────────┬─────────────────┬──────────────┐
    │                │                 │              │
┌───▼────┐    ┌──────▼───┐    ┌────────▼────┐       │
│ Users  │    │ Products │    │   Orders    │       │
│ Service│    │ Service  │    │   Service   │       │
│        │    │          │    │             │       │
│GraphQL │    │ GraphQL  │    │  REST API   │       │
│Port    │    │ Port     │    │  Port 3003  │       │
│3001    │    │ 3002     │    │             │       │
└────────┘    └──────────┘    └─────────────┘       │
                                                     │
                                            ┌────────▼────┐
                                            │  External   │
                                            │  Services   │
                                            │  (Optional) │
                                            └─────────────┘
```

## 🚀 Quick Start

### Using Federation Gateway (Recommended)

All services are accessible through the Federation Gateway at `http://localhost:4000`:

**GraphQL Playground:**
```
http://localhost:4000/graphql
```

**REST API Endpoints:**
- Health: `GET http://localhost:4000/health`
- Orders: `http://localhost:4000/api/orders`
- Auth: `http://localhost:4000/api/auth/*`
- Media: `http://localhost:4000/api/media/*`

### Direct Service Access

You can also access services directly:

| Service | Type | Port | URL |
|---------|------|------|-----|
| Federation Gateway | GraphQL + REST | 4000 | http://localhost:4000 |
| Users Service | GraphQL | 3001 | http://localhost:3001/graphql |
| Products Service | GraphQL | 3002 | http://localhost:3002/graphql |
| Orders Service | REST | 3003 | http://localhost:3003 |

## 🔐 Authentication

**⚠️ IMPORTANT:** All GraphQL endpoints (except login/register) now require JWT authentication.

To authenticate:

1. **Register a user** or **Login** via Users Service
2. Copy the `accessToken` from the response
3. Add to request headers: `Authorization: Bearer <token>`

**Example Login Query:**
```graphql
mutation Login {
  login(input: { email: "john@example.com", password: "password123" }) {
    accessToken
    user {
      id
      name
      email
      role
    }
  }
}
```

## 📊 Service Responsibilities

### Federation Gateway
- Unified API entry point
- Composes GraphQL subgraphs
- Proxies REST API requests
- Handles authentication
- Service health monitoring

### Users Service
- User registration and authentication
- JWT token generation
- User profile management
- Role-based access control

### Products Service
- Product catalog management
- Inventory tracking
- Category filtering
- Product CRUD operations

### Orders Service
- Order creation and tracking
- Order status management
- Multi-item order processing
- Shipping address management

## 🧪 Testing

### Health Checks

Check if all services are running:

```bash
# Gateway health (includes all services)
curl http://localhost:4000/health

# Individual services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### Sample Workflow

1. **Register a user:**
   ```graphql
   mutation {
     register(input: {
       name: "John Doe"
       email: "john@example.com"
       password: "password123"
       role: "USER"
     }) {
       accessToken
       user { id name email }
     }
   }
   ```

2. **Browse products:**
   ```graphql
   query {
     products {
       id
       name
       price
       stock
       category
     }
   }
   ```

3. **Create an order (via REST):**
   ```bash
   curl -X POST http://localhost:4000/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "1",
       "items": [{"productId": "1", "quantity": 2, "price": 199.99}],
       "shippingAddress": "123 Main St"
     }'
   ```

## 🗄️ Database

All services use **MongoDB** for persistent data storage:

- **Users Service:** MongoDB on port `27017` (users_db)
- **Products Service:** MongoDB on port `27018` (products_db)  
- **Orders Service:** MongoDB on port `27019` (orders_db)

Each service has its own MongoDB instance with automatic data seeding on first startup.

**See:** [MongoDB Setup Guide](./MONGODB-SETUP.md) for detailed information.

## 🛠️ Environment Variables

### Federation Gateway
- `PORT` - Gateway port (default: 4000)
- `USERS_SERVICE_URL` - Users service URL
- `PRODUCTS_SERVICE_URL` - Products service URL
- `ORDERS_SERVICE_URL` - Orders service URL
- `JWT_PUBLIC_KEY` - Public key for JWT verification

### Users Service
- `PORT` - Service port (default: 3001)
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time

### Products Service
- `PORT` - Service port (default: 3002)

### Orders Service
- `PORT` - Service port (default: 3003)

## 📖 Additional Resources

- [GraphQL Documentation](https://graphql.org/)
- [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Postman Documentation](https://learning.postman.com/)

## 🤝 Support

For issues or questions:
1. Check the service-specific documentation
2. Review the Postman collections
3. Check service health endpoints
4. Review logs: `docker-compose logs <service-name>`

## 📝 API Versioning

Current API version: **v1**

All services are currently in version 1. Future versions will be documented here.
