# Authentication Guide

## Overview

All GraphQL endpoints in the Federation Gateway are now protected by authentication. This means you must include a valid JWT token in your requests to access most queries and mutations.

## Public Endpoints (No Authentication Required)

The following endpoints are publicly accessible without authentication:

### GraphQL Operations
- `login` - User login mutation
- `register` - User registration mutation
- `IntrospectionQuery` - GraphQL schema introspection
- `__schema` - GraphQL schema metadata
- `_service` - Apollo Federation service metadata

### REST Endpoints
- `GET /health` - Gateway health check
- `GET /health/services` - Services health status
- All REST proxy endpoints have their own authentication rules

## Protected Endpoints (Authentication Required)

All other GraphQL queries and mutations require a valid JWT token:

### User Queries
- `users` - Get all users
- `user(id)` - Get user by ID
- `userByEmail(email)` - Get user by email
- `me` - Get current authenticated user

### Product Queries & Mutations
- `products` - Get all products
- `product(id)` - Get product by ID
- `productsByCategory(category)` - Get products by category
- `createProduct(...)` - Create a new product
- `updateProductStock(id, quantity)` - Update product stock

### User Mutations
- `createUser(...)` - Create a new user

## How to Authenticate

### Step 1: Login or Register

First, obtain a JWT token by logging in or registering:

**Login Mutation:**
```graphql
mutation Login {
  login(input: { 
    email: "john@example.com", 
    password: "password123" 
  }) {
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

**Register Mutation:**
```graphql
mutation Register {
  register(input: {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "USER"
  }) {
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

**Response:**
```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
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

### Step 2: Use the Access Token

Include the `accessToken` in the `Authorization` header for all subsequent requests:

**HTTP Header:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing with Different Tools

### Using GraphQL Playground

1. Open GraphQL Playground at `http://localhost:4000/graphql`
2. Login or register to get a token
3. Click on "HTTP HEADERS" at the bottom
4. Add the authorization header:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```
5. Now you can run protected queries

### Using Postman

1. Import the Postman collection: `postman/Federation-Gateway.postman_collection.json`
2. Run the "Login" request to get a token
3. Copy the `accessToken` from the response
4. Set the `ACCESS_TOKEN` variable in your environment
5. All protected requests will now include the token automatically

### Using cURL

**Protected Query Example:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "query": "{ products { id name price stock } }"
  }'
```

### Using HTTP Clients (Fetch, Axios, etc.)

**JavaScript Example:**
```javascript
const token = 'YOUR_ACCESS_TOKEN_HERE';

fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `
      query {
        products {
          id
          name
          price
          stock
        }
      }
    `,
  }),
})
.then(res => res.json())
.then(data => console.log(data));
```

## Error Responses

### Missing Token

If you try to access a protected endpoint without a token:

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Invalid or Expired Token

If your token is invalid or expired:

```json
{
  "errors": [
    {
      "message": "Invalid or expired token",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

## Token Details

### Token Structure

JWT tokens are signed using RS256 (RSA with SHA-256) algorithm and contain:

```json
{
  "userId": "1",
  "email": "john@example.com",
  "role": "USER",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Token Expiration

- Default expiration: **24 hours**
- Configurable via `JWT_EXPIRES_IN` environment variable
- After expiration, you must login again to get a new token

### Token Storage

**Best Practices:**
- **Web Apps:** Store in httpOnly cookies or secure storage
- **Mobile Apps:** Use secure storage (Keychain on iOS, KeyStore on Android)
- **Desktop Apps:** Use encrypted storage
- **Never** store tokens in localStorage or sessionStorage (XSS vulnerability)

## Security Best Practices

1. **Use HTTPS in Production**
   - Never send tokens over unencrypted HTTP
   - Configure SSL/TLS certificates

2. **Validate Token on Every Request**
   - The gateway validates tokens automatically
   - Subgraphs receive forwarded authorization headers

3. **Handle Token Expiration**
   - Implement token refresh logic in your client
   - Show login prompt when token expires

4. **Protect Sensitive Operations**
   - Use role-based access control (RBAC)
   - Verify user permissions in resolvers

5. **Monitor for Suspicious Activity**
   - Log failed authentication attempts
   - Implement rate limiting
   - Use anomaly detection

## Development vs Production

### Development Mode

In development, introspection and playground are enabled:
```env
APOLLO_PLAYGROUND=true
APOLLO_INTROSPECTION=true
```

### Production Mode

In production, disable playground and restrict introspection:
```env
APOLLO_PLAYGROUND=false
APOLLO_INTROSPECTION=false
```

## Troubleshooting

### "Unauthorized" Error on Public Endpoints

If you're getting unauthorized errors on login/register:
1. Verify the operation name matches the public list
2. Check the GraphQL query/mutation name
3. Ensure no typos in operation names

### Token Not Being Forwarded to Subgraphs

If subgraphs can't access user context:
1. Check authorization header format: `Bearer <token>`
2. Verify gateway's `buildService` forwards headers
3. Check subgraph JWT verification setup

### Token Validation Fails

If tokens are rejected:
1. Verify JWT public key matches private key
2. Check token hasn't expired
3. Ensure token algorithm is RS256
4. Validate token payload structure

## Migration from Previous Version

If you were using the API before authentication was added:

1. **Update Client Code:**
   - Add token storage logic
   - Include Authorization header in requests
   - Handle token expiration

2. **Update Tests:**
   - Login before running protected queries
   - Store token for subsequent requests
   - Test both authenticated and unauthenticated scenarios

3. **Update Documentation:**
   - Inform API consumers about authentication
   - Provide token refresh guidelines
   - Update API examples

## Examples

### Complete Authentication Flow

```javascript
// 1. Register a new user
const registerResponse = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      mutation {
        register(input: {
          name: "Jane Doe",
          email: "jane@example.com",
          password: "securePassword123",
          role: "USER"
        }) {
          accessToken
          user { id name email }
        }
      }
    `,
  }),
});

const { data } = await registerResponse.json();
const token = data.register.accessToken;

// 2. Use token for protected queries
const productsResponse = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: '{ products { id name price } }',
  }),
});

const products = await productsResponse.json();
console.log(products);

// 3. Get current user info
const meResponse = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: '{ me { id name email role } }',
  }),
});

const currentUser = await meResponse.json();
console.log(currentUser);
```

## Related Documentation

- [Federation Gateway Documentation](./FEDERATION-GATEWAY.md)
- [Users Service Documentation](./USERS-SERVICE.md)
- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens
- [GraphQL Authentication Best Practices](https://www.apollographql.com/docs/apollo-server/security/authentication/)

## Support

For issues or questions:
1. Check service health: `http://localhost:4000/health`
2. Review gateway logs: `docker-compose logs federation-gateway`
3. Verify token validity at [jwt.io](https://jwt.io)
4. Check environment configuration
