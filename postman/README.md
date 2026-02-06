# Federation Gateway - Postman Collection

This folder contains the Postman collection and environment files for testing the Federation Gateway and all microservices.

## Files

- **Federation-Gateway-API.postman_collection.json** - Complete API collection with all endpoints
- **Federation-Gateway.postman_environment.json** - Environment variables for local development

## Quick Start

### 1. Import into Postman

#### Option A: Using Postman Desktop App
1. Open Postman
2. Click **Import** button (top-left)
3. Select both JSON files from this folder:
   - `Federation-Gateway-API.postman_collection.json`
   - `Federation-Gateway.postman_environment.json`
4. Click **Import**

#### Option B: Using Postman Web
1. Go to [Postman Web](https://web.postman.co/)
2. Click **Import** in your workspace
3. Drag and drop both JSON files
4. Click **Import**

### 2. Select Environment
1. Click the environment dropdown (top-right)
2. Select **"Federation Gateway - Local"**

### 3. Start Testing!

## Collection Structure

### 🏥 Health Checks
Test gateway and service health status
- **Gateway Health Check** - Overall health of gateway and services
- **Services Health Check** - Detailed status of each service

### 🔐 Authentication (GraphQL)
User registration and login
- **Register User** - Create new account (auto-saves JWT token)
- **Login User** - Authenticate existing user (auto-saves JWT token)

### 👥 Users Service (GraphQL)
User management via federated GraphQL
- **Get Current User Profile (Me)** - Get authenticated user's profile
- **Get All Users** - List all users
- **Get User by ID** - Find specific user
- **Get User by Email** - Search by email
- **Create User** - Admin user creation

### 📦 Products Service (GraphQL)
Product catalog management
- **Get All Products** - List all products
- **Get Product by ID** - Get specific product
- **Get Products by Category** - Filter by category
- **Create Product** - Add new product (requires auth)
- **Update Product Stock** - Adjust inventory (requires auth)

### 🛒 Orders Service (REST)
Order management via REST API proxy
- **Get All Orders** - List all orders (requires auth)
- **Get Orders by User ID** - Filter orders by user (requires auth)
- **Get Order by ID** - Get specific order (requires auth)
- **Create Order** - Place new order (requires auth)
- **Update Order** - Modify order status/address (requires auth)
- **Delete Order** - Remove order (requires auth)

### 🔗 Combined Queries (Federation)
Examples of federated queries combining multiple services
- **Get Products with Extended Info** - Cross-service data
- **Get User with Profile** - User + products in one query

## Testing Workflow

### Step 1: Verify Services are Running
```
1. Run: "Gateway Health Check"
2. Ensure all services show status "healthy"
```

### Step 2: Register & Login
```
1. Run: "Register User" 
   - Creates account and saves JWT token automatically
   - OR -
2. Run: "Login User"
   - Authenticates and saves JWT token automatically
```

### Step 3: Test Authenticated Endpoints
Once logged in, the JWT token is automatically included in requests that need authentication:
- Get Current User Profile (Me)
- Create Product
- All Orders endpoints

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `gateway_url` | Federation Gateway base URL | `http://localhost:4000` |
| `jwt_token` | JWT authentication token | Auto-set by login/register |
| `test_user_email` | Default test email | `john.doe@example.com` |
| `test_user_password` | Default test password | `SecurePassword123!` |
| `test_user_id` | Default test user ID | `1` |

## Authentication

### Automatic Token Management
The collection includes test scripts that automatically:
1. Extract JWT tokens from login/register responses
2. Save tokens to the environment variable `jwt_token`
3. Include tokens in subsequent authenticated requests

### Manual Token Usage
If needed, you can manually set the token:
1. Copy the token from a login/register response
2. Go to Environment variables
3. Set the `jwt_token` value

## Request Headers

### GraphQL Requests (Users & Products)
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}  # For authenticated queries/mutations
```

### REST Requests (Orders)
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}  # Required for all orders endpoints
```

## Example Requests

### 1. Register a New User
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      name
      email
      role
    }
  }
}

Variables:
{
  "input": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "role": "user"
  }
}
```

### 2. Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      name
      email
    }
  }
}

Variables:
{
  "input": {
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }
}
```

### 3. Get Current User Profile
```graphql
query Me {
  me {
    id
    name
    email
    role
    createdAt
  }
}

Headers:
Authorization: Bearer {{jwt_token}}
```

### 4. Create an Order (REST)
```http
POST {{gateway_url}}/api/orders
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "userId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 1299.99
    }
  ],
  "shippingAddress": "123 Main St, New York, NY 10001"
}
```

### 5. Federated Query Example
```graphql
query GetUserProfile {
  me {
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

## GraphQL Playground Alternative

You can also test GraphQL queries directly in the browser:
```
http://localhost:4000/graphql
```

The playground provides:
- Schema documentation
- Auto-completion
- Query history
- Variables panel

To use authenticated queries in the playground, add the HTTP header:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

## Troubleshooting

### "Unauthorized" Errors
- Ensure you've logged in and the JWT token is saved
- Check the Authorization header includes `Bearer {{jwt_token}}`
- Token may have expired - try logging in again

### Connection Refused
- Verify gateway is running: `docker ps` or check logs
- Confirm gateway URL is correct: `http://localhost:4000`
- Check if services are healthy via Health Check endpoint

### Service Unavailable
- Run "Services Health Check" to see which service is down
- Check Docker containers: `docker-compose ps`
- Review service logs: `docker-compose logs [service-name]`

### GraphQL Errors
- Check the response "errors" array for details
- Verify variable types match the schema
- Ensure required fields are provided

## Tips

1. **Use Folders**: Tests are organized by service - expand folders to see all endpoints
2. **Check Test Scripts**: Login/Register requests auto-save tokens
3. **Variables**: Use `{{variable}}` syntax to reference environment variables
4. **Bulk Run**: Use Collection Runner to test all endpoints sequentially
5. **Save Responses**: Use "Save Response" to create example responses for documentation

## Order Status Values

When updating orders, use these status values:
- `pending` - Order created, awaiting processing
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled

## Product Categories

Common category values for testing:
- Electronics
- Clothing
- Books
- Home & Garden
- Sports & Outdoors

## Need Help?

- Review the Gateway documentation in `/docs`
- Check service-specific docs: `USERS-SERVICE.md`, `PRODUCTS-SERVICE.md`, `ORDERS-SERVICE.md`
- View the main `README.md` for setup instructions
