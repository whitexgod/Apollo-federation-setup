# Federation Gateway

A modern Apollo Federation Gateway that provides a unified GraphQL API and REST proxy for microservices architecture.

## 🚀 Features

- **Apollo Federation 2**: Unified GraphQL supergraph from multiple subgraphs
- **JWT Authentication**: Secure token validation for GraphQL and REST APIs
- **REST API Proxy**: Forward REST requests to microservices with authentication
- **Health Monitoring**: Built-in health checks for all services
- **Auto Schema Composition**: Automatic supergraph generation from subgraphs
- **Production Ready**: Docker support, logging, error handling, and CORS
- **Type Safe**: Full TypeScript implementation

## 📋 Architecture

```
Client Applications
        ↓
Federation Gateway (Port 4000)
        ├── GraphQL Supergraph
        │   ├── Auth Subgraph (port 3000)
        │   └── Notification Subgraph (port 3002)
        └── REST API Proxy
            └── Auth REST endpoints
```

## 🛠️ Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Auth microservice running on port 3000
- Notification microservice running on port 3002

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## ⚙️ Configuration

Edit `.env` file:

```env
# Server
PORT=4000
NODE_ENV=development

# JWT Configuration (must match auth service)
JWT_SECRET=your-super-secret-jwt-key

# Subgraph Services
AUTH_SERVICE_URL=http://localhost:3000/graphql
NOTIFICATION_SERVICE_URL=http://localhost:3002/graphql

# REST Proxy
AUTH_REST_SERVICE_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

## 🚀 Running the Gateway

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
# Build
npm run build

# Start
npm run start:prod
```

### Docker

```bash
# Build image
docker build -t federation-gateway .

# Run with docker-compose
docker-compose up -d
```

## 📡 API Endpoints

### GraphQL

**Endpoint**: `http://localhost:4000/graphql`

Access the unified supergraph with all queries and mutations from auth and notification services.

**Example Query**:
```graphql
query {
  getProfile {
    id
    email
    firstName
    lastName
  }
}
```

**With Authentication**:
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"{ getProfile { id email } }"}'
```

### REST API Proxy

**Base Path**: `http://localhost:4000/api/auth`

#### Public Endpoints (No Auth Required)

- `POST /api/auth/public/*` - Public endpoints

#### Protected Endpoints (Auth Required)

- `POST /api/auth/profile-picture/upload` - Upload profile picture
- `DELETE /api/auth/profile-picture/delete` - Delete profile picture
- `GET /api/auth/profile-picture/:userId` - Get profile picture

#### OAuth Endpoints

- `GET /api/auth/google/login` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

**Example**:
```bash
# Upload profile picture
curl -X POST http://localhost:4000/api/auth/profile-picture/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Health Check

**Endpoint**: `http://localhost:4000/health`

```bash
curl http://localhost:4000/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-04T10:00:00.000Z",
  "services": [
    {
      "name": "auth-service",
      "status": "healthy",
      "responseTime": 45
    },
    {
      "name": "notification-service",
      "status": "healthy",
      "responseTime": 32
    }
  ],
  "gateway": {
    "uptime": 12345,
    "memory": { ... }
  }
}
```

## 🔐 Authentication

The gateway supports **two methods** for JWT token validation:

### **Option 1: JWKS (Recommended for Production)**

Uses **RSA256** asymmetric encryption with JSON Web Key Sets:

✅ More secure (public/private key pairs)  
✅ Easy key rotation  
✅ Industry standard (OAuth 2.0, OpenID Connect)  
✅ Private key never leaves auth service  

**Configuration**:
```env
USE_JWKS=true
```

**Requirements**:
- `jwks.json` file in gateway root (contains RSA public key)
- Auth service must sign tokens with RS256
- See `JWKS_AUTHENTICATION.md` for complete guide

### **Option 2: JWT_SECRET (Fallback)**

Uses **HS256** symmetric encryption with shared secret:

**Configuration**:
```env
USE_JWKS=false
JWT_SECRET=your-shared-secret
```

**Note**: JWT_SECRET must match auth service exactly.

### Token Format

```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "roles": ["USER", "ADMIN"],
  "workspaceId": "workspace-id",
  "privileges": ["READ_USERS", "WRITE_USERS"]
}
```

### Testing Authentication

```bash
# Test JWKS authentication
./test-jwks.sh

# Manual test
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ getProfile { id email } }"}'
```

### Context Propagation

The gateway automatically forwards these headers to subgraphs:
- `authorization` - Original JWT token
- `x-user-id` - User ID from token
- `x-user-email` - User email
- `x-user-roles` - JSON array of roles
- `x-workspace-id` - Workspace ID (if present)

## 📝 Generating Superschema

Generate a superschema file for client tooling (GraphQL codegen, Apollo Client, etc.):

```bash
# Make sure both subgraph services are running
npm run generate:schema
```

This creates `superschema.graphql` in the project root.

## 🧪 Testing

### Test GraphQL Endpoint

```bash
# Test query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

### Test with Authentication

```bash
# Get a token from auth service first
TOKEN=$(curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"user@example.com\", password: \"password\") { accessToken } }"}' \
  | jq -r '.data.login.accessToken')

# Use token to query protected resources
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ getProfile { id email } }"}'
```

## 📊 Monitoring

### View Logs

```bash
# Docker logs
docker logs federation-gateway -f

# Service health
curl http://localhost:4000/health/services
```

## 🏗️ Project Structure

```
federation-gateway/
├── src/
│   ├── auth/                    # JWT authentication
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   ├── proxy/                   # REST API proxy
│   │   ├── proxy.controller.ts
│   │   ├── proxy.service.ts
│   │   └── proxy.module.ts
│   ├── health/                  # Health checks
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── health.module.ts
│   ├── config/                  # Configuration
│   │   ├── config.service.ts
│   │   └── config.module.ts
│   ├── common/                  # Shared utilities
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── middleware/
│   ├── scripts/                 # Utility scripts
│   │   └── generate-superschema.ts
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### Gateway can't connect to subgraphs

1. Verify services are running:
   ```bash
   curl http://localhost:3000/graphql -d '{"query":"{ __typename }"}'
   curl http://localhost:3002/graphql -d '{"query":"{ __typename }"}'
   ```

2. Check service URLs in `.env`

3. Check network connectivity (Docker network if using containers)

### Authentication errors

1. Verify JWT_SECRET matches auth service
2. Check token expiration
3. Verify token format includes required fields (userId, email, roles)

### CORS errors

Add your frontend URL to `CORS_ORIGIN` in `.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3001,http://your-frontend-url
```

## 📚 Learn More

- [Apollo Federation Documentation](https://www.apollographql.com/docs/federation/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/)

## 📄 License

MIT
