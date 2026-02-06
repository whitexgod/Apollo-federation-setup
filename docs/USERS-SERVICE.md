# Users Service Documentation

## 📋 Overview

The Users Service is a GraphQL subgraph that handles user management, authentication, and authorization. It's part of the Apollo Federation architecture and provides user-related functionality to the entire system.

**Port:** `3001`  
**Base URL:** `http://localhost:3001`  
**GraphQL Endpoint:** `http://localhost:3001/graphql`  
**Type:** GraphQL Subgraph (Apollo Federation)

## 🎯 Key Features

- **User Registration** - Create new user accounts with password hashing
- **Authentication** - JWT token generation using RS256 algorithm
- **User Management** - CRUD operations for user profiles
- **Role-Based Access** - Support for different user roles (USER, ADMIN)
- **Federation Support** - Entity resolution for cross-service queries
- **Password Security** - Bcrypt password hashing
- **In-Memory Storage** - Fast, volatile data store (development)

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│         Users Service (Port 3001)                │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │      GraphQL API (Apollo Federation)       │ │
│  │  - ApolloFederationDriver                  │ │
│  │  - Schema with @key directives             │ │
│  │  - Entity resolution                       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Auth Module                        │ │
│  │  - JWT Strategy (RS256)                    │ │
│  │  - Login/Register Resolvers                │ │
│  │  - Password hashing (bcrypt)               │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Users Module                       │ │
│  │  - User queries & mutations                │ │
│  │  - User entity with @Directive('@key')     │ │
│  │  - @ResolveReference for federation        │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         In-Memory Storage                  │ │
│  │  - Users map (id → User)                   │ │
│  │  - Fast read/write operations              │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 📊 Data Model

### User Entity

```typescript
@ObjectType()
@Directive('@key(fields: "id")')
class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  role: string;  // 'USER' | 'ADMIN'

  @Field()
  createdAt: Date;

  // Password is stored but not exposed via GraphQL
  password?: string;
}
```

**Default Users:**
```typescript
{
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',  // Hashed in storage
  role: 'USER',
  createdAt: '2024-01-01T00:00:00.000Z'
}
```

## 📡 API Reference

### Health Check

**Endpoint:** `GET http://localhost:3001/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

### GraphQL Schema

#### Types

**User**
```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String!
  role: String!
  createdAt: DateTime!
}
```

**AuthResponse**
```graphql
type AuthResponse {
  accessToken: String!
  user: User!
}
```

**LoginInput**
```graphql
input LoginInput {
  email: String!
  password: String!
}
```

**RegisterInput**
```graphql
input RegisterInput {
  name: String!
  email: String!
  password: String!
  role: String
}
```

### Queries

#### Get All Users
```graphql
query GetAllUsers {
  users {
    id
    name
    email
    role
    createdAt
  }
}
```

**Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get User By ID
```graphql
query GetUser($id: String!) {
  user(id: $id) {
    id
    name
    email
    role
    createdAt
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

#### Get User By Email
```graphql
query GetUserByEmail($email: String!) {
  userByEmail(email: $email) {
    id
    name
    email
    role
    createdAt
  }
}
```

**Variables:**
```json
{
  "email": "john@example.com"
}
```

#### Get Current User (Me)
**Requires Authentication**

```graphql
query GetMe {
  me {
    id
    name
    email
    role
    createdAt
  }
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Mutations

#### Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
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

**Variables:**
```json
{
  "input": {
    "email": "john@example.com",
    "password": "password123"
  }
}
```

**Response:**
```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MTA4MTYwMH0...",
      "user": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER"
      }
    }
  }
}
```

#### Register
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
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

**Variables:**
```json
{
  "input": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePassword123",
    "role": "USER"
  }
}
```

**Response:** Same format as login

#### Create User
```graphql
mutation CreateUser($name: String!, $email: String!, $role: String) {
  createUser(name: $name, email: $email, role: $role) {
    id
    name
    email
    role
    createdAt
  }
}
```

**Variables:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

**Note:** This mutation creates a user without a password - intended for admin use or system-created accounts.

## 🔐 Authentication & Security

### JWT Token Structure

**Algorithm:** RS256 (RSA Signature with SHA-256)  
**Key Pair:** Located in `/users-service/keys/`

**Token Payload:**
```json
{
  "userId": "1",
  "email": "john@example.com",
  "role": "USER",
  "iat": 1640995200,
  "exp": 1641081600
}
```

**Expiration:** 24 hours (configurable via `JWT_EXPIRES_IN`)

### Password Security

- **Hashing:** bcrypt with salt rounds = 10
- **Storage:** Passwords are never returned in GraphQL responses
- **Validation:** Email uniqueness enforced

### Key Management

**Private Key:** `users-service/keys/jwtRS256.key`
- Used to sign JWT tokens
- Must be kept secure
- Never expose in client applications

**Public Key:** `users-service/keys/jwtRS256.key.pub`
- Used by Gateway to verify tokens
- Can be safely distributed
- Shared with Federation Gateway

### Authentication Guards

**GqlAuthGuard:** Protects GraphQL resolvers that require authentication

```typescript
@UseGuards(GqlAuthGuard)
@Query(() => User)
me(@CurrentUser() user: any) {
  // Only accessible with valid JWT token
}
```

## 🔄 Federation Support

### Entity Key

The User entity is marked with `@key(fields: "id")` directive, making it a federated entity:

```graphql
type User @key(fields: "id") {
  id: ID!
  # ... other fields
}
```

### Reference Resolution

Other services can reference User entities:

```typescript
@ResolveReference()
resolveReference(reference: { __typename: string; id: string }) {
  return this.usersService.findById(reference.id);
}
```

**Example Usage in Other Services:**
```graphql
# In Products or Orders Service
type Product {
  id: ID!
  name: String!
  createdBy: User  # References Users Service
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

## 🛠️ Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Key Paths (optional)
JWT_PRIVATE_KEY_PATH=/app/keys/jwtRS256.key
JWT_PUBLIC_KEY_PATH=/app/keys/jwtRS256.key.pub
```

### Docker Configuration

**Dockerfile:** Multi-stage build for development and production

**Docker Compose:**
```yaml
users-service:
  build: ./users-service
  ports:
    - "3001:3001"
  environment:
    - NODE_ENV=development
    - PORT=3001
    - JWT_SECRET=your-super-secret-jwt-key-change-in-production
    - JWT_EXPIRES_IN=24h
  volumes:
    - ./users-service/keys:/app/keys
```

## 🧪 Testing

### Using Postman

Import: `postman/Users-Service.postman_collection.json`

**Test Flow:**
1. Register a new user
2. Login with credentials
3. Copy accessToken from response
4. Use token in Authorization header for protected queries

### Using GraphQL Playground

1. Navigate to `http://localhost:3001/graphql`
2. Register or login to get a token
3. Set HTTP header: `{"Authorization": "Bearer <token>"}`
4. Run protected queries like `me`

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { name: \"Test User\", email: \"test@example.com\", password: \"test123\", role: \"USER\" }) { accessToken user { id name email } } }"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"john@example.com\", password: \"password123\" }) { accessToken user { id name email } } }"
  }'
```

**Get Users:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name email role } }"}'
```

## 📁 Project Structure

```
users-service/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Main module with GraphQL config
│   ├── auth/
│   │   ├── auth.module.ts           # Authentication module
│   │   ├── auth.service.ts          # JWT & password logic
│   │   ├── auth.resolver.ts         # Login/register mutations
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts      # JWT passport strategy
│   │   ├── guards/
│   │   │   └── gql-auth.guard.ts    # GraphQL auth guard
│   │   ├── decorators/
│   │   │   ├── auth.decorator.ts    # @Auth() decorator
│   │   │   └── current-user.decorator.ts  # @CurrentUser() decorator
│   │   └── dto/
│   │       ├── login.input.ts       # Login input type
│   │       ├── register.input.ts    # Register input type
│   │       └── auth-response.ts     # Auth response type
│   ├── users/
│   │   ├── users.module.ts          # Users module
│   │   ├── users.service.ts         # User business logic
│   │   ├── users.resolver.ts        # User queries/mutations
│   │   └── user.entity.ts           # User GraphQL type
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
├── keys/
│   ├── jwtRS256.key                 # Private key (JWT signing)
│   ├── jwtRS256.key.pub             # Public key (JWT verification)
│   └── README.md                    # Key generation instructions
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Development

### Starting the Service

```bash
cd users-service
npm install
npm run start:dev
```

### Running with Docker

```bash
docker-compose up users-service
```

### Generating JWT Keys

```bash
cd users-service/keys
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N ""
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

## 🔍 Common Use Cases

### User Registration Flow

1. Client calls `register` mutation with user details
2. Service validates email uniqueness
3. Password is hashed using bcrypt
4. User is created with auto-generated ID
5. JWT token is generated and returned
6. Client stores token for future requests

### User Login Flow

1. Client calls `login` mutation with email and password
2. Service finds user by email
3. Password is verified against stored hash
4. JWT token is generated if credentials are valid
5. Token and user details are returned

### Protected Query Flow

1. Client includes JWT token in Authorization header
2. Gateway validates token using public key
3. User context is extracted from token
4. Request is forwarded to Users Service with context
5. Service resolver can access user via `@CurrentUser()` decorator

## ⚠️ Important Notes

### In-Memory Storage

- **Data is volatile** - All data is lost when service restarts
- **Not for production** - Use a real database (PostgreSQL, MongoDB, etc.)
- **Performance** - Fast for development and testing
- **Concurrency** - No transaction support

### Security Considerations

1. **Change JWT_SECRET in production** - Use a strong, random secret
2. **Rotate JWT keys periodically** - Update key pairs regularly
3. **Use HTTPS in production** - Never send tokens over HTTP
4. **Validate input** - Email format, password strength
5. **Rate limiting** - Implement to prevent brute force attacks

### Default Users

The service comes with a default user:
```
Email: john@example.com
Password: password123
Role: USER
```

**Change or remove this in production!**

## 🚀 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub, etc.)
- [ ] User profile updates
- [ ] Account deactivation
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] Password strength validation

## 📚 Related Documentation

- [Federation Gateway Documentation](./FEDERATION-GATEWAY.md)
- [Products Service Documentation](./PRODUCTS-SERVICE.md)
- [Orders Service Documentation](./ORDERS-SERVICE.md)
- [JWT.io](https://jwt.io/) - JWT decoder and documentation

## 🤝 Best Practices

1. **Always use the Gateway** for client requests in production
2. **Store JWT tokens securely** (httpOnly cookies or secure storage)
3. **Implement token refresh** for long-lived sessions
4. **Validate all inputs** before processing
5. **Log authentication events** for security auditing
6. **Use environment variables** for sensitive configuration
7. **Test authentication flows** thoroughly
8. **Keep dependencies updated** for security patches
