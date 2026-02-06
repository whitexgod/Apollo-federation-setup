# Complete Testing Workflow - Federation Gateway

This guide provides a step-by-step testing workflow to verify all services are working correctly through the Federation Gateway.

## 🎯 Prerequisites

- Federation Gateway running on `http://localhost:4000`
- All services (users, products, orders) running
- Postman with collection and environment imported

## 📝 Complete Test Sequence

### Phase 1: Infrastructure Verification ✅

#### Test 1.1: Gateway Health Check
```
Request: Health Checks → Gateway Health Check
Method: GET
URL: {{gateway_url}}/health
Auth: None

Expected Response:
{
  "status": "healthy",
  "timestamp": "...",
  "services": [...],
  "gateway": {
    "uptime": ...,
    "memory": {...}
  }
}

✅ Verify: status = "healthy"
```

#### Test 1.2: Services Health Check
```
Request: Health Checks → Services Health Check
Method: GET
URL: {{gateway_url}}/health/services
Auth: None

Expected Response:
[
  { "name": "Users Service", "status": "healthy", ... },
  { "name": "Products Service", "status": "healthy", ... },
  { "name": "Orders Service", "status": "healthy", ... }
]

✅ Verify: All services show "healthy"
```

---

### Phase 2: Authentication & User Management 🔐

#### Test 2.1: Register New User
```
Request: Authentication → Register User
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      name
      email
      role
      createdAt
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

Expected Response:
{
  "data": {
    "register": {
      "token": "eyJhbGc...",
      "user": {
        "id": "...",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "createdAt": "..."
      }
    }
  }
}

✅ Verify: Token is returned and auto-saved to {{jwt_token}}
✅ Verify: User object contains correct data
```

#### Test 2.2: Login Existing User
```
Request: Authentication → Login User
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
mutation Login($input: LoginInput!) {
  login(input: $input) {
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
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }
}

Expected Response:
{
  "data": {
    "login": {
      "token": "eyJhbGc...",
      "user": { ... }
    }
  }
}

✅ Verify: Login successful with valid credentials
✅ Verify: Token is auto-saved
```

#### Test 2.3: Get Current User Profile
```
Request: Users Service → Get Current User Profile (Me)
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: Bearer {{jwt_token}}

Query:
query Me {
  me {
    id
    name
    email
    role
    createdAt
    updatedAt
  }
}

Expected Response:
{
  "data": {
    "me": {
      "id": "...",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}

✅ Verify: Returns authenticated user's profile
✅ Verify: JWT authentication is working
```

#### Test 2.4: Get All Users
```
Request: Users Service → Get All Users
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
query GetUsers {
  users {
    id
    name
    email
    role
    createdAt
  }
}

Expected Response:
{
  "data": {
    "users": [
      { "id": "1", "name": "...", ... },
      { "id": "2", "name": "...", ... }
    ]
  }
}

✅ Verify: Returns array of users
✅ Verify: Newly registered user appears in list
```

---

### Phase 3: Products Service Testing 📦

#### Test 3.1: Get All Products
```
Request: Products Service → Get All Products
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
query GetProducts {
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

Expected Response:
{
  "data": {
    "products": [
      {
        "id": "1",
        "name": "Sample Product",
        "price": 99.99,
        "stock": 100,
        "category": "Electronics"
      }
    ]
  }
}

✅ Verify: Returns array of products
✅ Verify: Product data is complete
```

#### Test 3.2: Get Product by ID
```
Request: Products Service → Get Product by ID
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
query GetProduct($id: String!) {
  product(id: $id) {
    id
    name
    description
    price
    stock
    category
  }
}

Variables:
{
  "id": "1"
}

Expected Response:
{
  "data": {
    "product": {
      "id": "1",
      "name": "...",
      "price": ...,
      ...
    }
  }
}

✅ Verify: Returns specific product
✅ Verify: Product ID matches request
```

#### Test 3.3: Get Products by Category
```
Request: Products Service → Get Products by Category
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
query GetProductsByCategory($category: String!) {
  productsByCategory(category: $category) {
    id
    name
    price
    category
  }
}

Variables:
{
  "category": "Electronics"
}

Expected Response:
{
  "data": {
    "productsByCategory": [
      { "id": "1", "category": "Electronics", ... }
    ]
  }
}

✅ Verify: Returns only products in specified category
```

#### Test 3.4: Create Product (Authenticated)
```
Request: Products Service → Create Product
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: Bearer {{jwt_token}}

Query:
mutation CreateProduct($name: String!, $description: String!, $price: Float!, $stock: Int!, $category: String!) {
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

Variables:
{
  "name": "Laptop",
  "description": "High-performance laptop for professionals",
  "price": 1299.99,
  "stock": 50,
  "category": "Electronics"
}

Expected Response:
{
  "data": {
    "createProduct": {
      "id": "...",
      "name": "Laptop",
      "price": 1299.99,
      "stock": 50,
      ...
    }
  }
}

✅ Verify: Product created successfully
✅ Verify: Returns new product with ID
✅ Note: Save the product ID for next tests
```

#### Test 3.5: Update Product Stock
```
Request: Products Service → Update Product Stock
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: Bearer {{jwt_token}}

Query:
mutation UpdateProductStock($id: String!, $quantity: Int!) {
  updateProductStock(id: $id, quantity: $quantity) {
    id
    name
    stock
    updatedAt
  }
}

Variables:
{
  "id": "1",
  "quantity": -5
}

Expected Response:
{
  "data": {
    "updateProductStock": {
      "id": "1",
      "stock": 45,  // Original 50 - 5
      ...
    }
  }
}

✅ Verify: Stock quantity updated correctly
✅ Verify: Use negative values to decrease stock
```

---

### Phase 4: Orders Service Testing 🛒

#### Test 4.1: Get All Orders
```
Request: Orders Service → Get All Orders
Method: GET
URL: {{gateway_url}}/api/orders
Auth: Bearer {{jwt_token}}

Expected Response:
[
  {
    "id": "1",
    "userId": "1",
    "items": [...],
    "totalAmount": 2599.98,
    "status": "pending",
    "shippingAddress": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]

✅ Verify: Returns array of orders
✅ Verify: Authentication required
```

#### Test 4.2: Create Order
```
Request: Orders Service → Create Order
Method: POST
URL: {{gateway_url}}/api/orders
Auth: Bearer {{jwt_token}}
Content-Type: application/json

Body:
{
  "userId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 1299.99
    },
    {
      "productId": "2",
      "quantity": 1,
      "price": 599.99
    }
  ],
  "shippingAddress": "123 Main St, New York, NY 10001"
}

Expected Response:
{
  "id": "...",
  "userId": "1",
  "items": [
    { "productId": "1", "quantity": 2, "price": 1299.99 },
    { "productId": "2", "quantity": 1, "price": 599.99 }
  ],
  "totalAmount": 3199.97,
  "status": "pending",
  "shippingAddress": "123 Main St, New York, NY 10001",
  "createdAt": "...",
  "updatedAt": "..."
}

✅ Verify: Order created successfully
✅ Verify: Total amount calculated correctly
✅ Verify: Status is "pending"
✅ Note: Save the order ID for next tests
```

#### Test 4.3: Get Order by ID
```
Request: Orders Service → Get Order by ID
Method: GET
URL: {{gateway_url}}/api/orders/{orderId}
Auth: Bearer {{jwt_token}}

Expected Response:
{
  "id": "{orderId}",
  "userId": "1",
  "items": [...],
  "totalAmount": 3199.97,
  "status": "pending",
  ...
}

✅ Verify: Returns correct order
✅ Verify: Order ID matches request
```

#### Test 4.4: Get Orders by User ID
```
Request: Orders Service → Get Orders by User ID
Method: GET
URL: {{gateway_url}}/api/orders?userId=1
Auth: Bearer {{jwt_token}}

Expected Response:
[
  {
    "id": "...",
    "userId": "1",
    ...
  }
]

✅ Verify: Returns only orders for specified user
✅ Verify: All returned orders have userId = "1"
```

#### Test 4.5: Update Order
```
Request: Orders Service → Update Order
Method: PUT
URL: {{gateway_url}}/api/orders/{orderId}
Auth: Bearer {{jwt_token}}
Content-Type: application/json

Body:
{
  "status": "shipped",
  "shippingAddress": "456 Oak Ave, Los Angeles, CA 90001"
}

Expected Response:
{
  "id": "{orderId}",
  "status": "shipped",
  "shippingAddress": "456 Oak Ave, Los Angeles, CA 90001",
  "updatedAt": "..."
}

✅ Verify: Order status updated to "shipped"
✅ Verify: Shipping address updated
✅ Verify: updatedAt timestamp changed
```

#### Test 4.6: Delete Order
```
Request: Orders Service → Delete Order
Method: DELETE
URL: {{gateway_url}}/api/orders/{orderId}
Auth: Bearer {{jwt_token}}

Expected Response:
Status: 204 No Content

✅ Verify: Status code is 204
✅ Verify: Order no longer appears in Get All Orders
```

---

### Phase 5: Federation Testing 🔗

#### Test 5.1: Combined User + Products Query
```
Request: Combined Queries → Get User with Profile
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: Bearer {{jwt_token}}

Query:
query GetUserProfile {
  me {
    id
    name
    email
    role
    createdAt
  }
  products {
    id
    name
    price
    category
  }
}

Expected Response:
{
  "data": {
    "me": {
      "id": "1",
      "name": "John Doe",
      ...
    },
    "products": [
      { "id": "1", "name": "Laptop", ... },
      { "id": "2", "name": "Mouse", ... }
    ]
  }
}

✅ Verify: Single query returns data from multiple services
✅ Verify: Both user and products data are complete
✅ Verify: Federation gateway is working correctly
```

#### Test 5.2: Multi-Service Data Fetch
```
Request: Combined Queries → Get Products with Extended Info
Method: POST (GraphQL)
URL: {{gateway_url}}/graphql
Auth: None

Query:
query GetProductsWithInfo {
  products {
    id
    name
    price
    stock
  }
  users {
    id
    name
    email
  }
}

Expected Response:
{
  "data": {
    "products": [...],
    "users": [...]
  }
}

✅ Verify: Data from both services in single response
✅ Verify: No authentication errors on public queries
```

---

## 🎯 Test Results Checklist

### Infrastructure ✅
- [ ] Gateway health check passes
- [ ] All services are healthy
- [ ] GraphQL endpoint is accessible

### Authentication ✅
- [ ] User registration works
- [ ] JWT token is generated and saved
- [ ] Login with valid credentials succeeds
- [ ] Authentication protects endpoints correctly
- [ ] Current user profile retrieval works

### Users Service ✅
- [ ] Get all users works
- [ ] Get user by ID works
- [ ] Get user by email works
- [ ] Create user works
- [ ] Me query returns authenticated user

### Products Service ✅
- [ ] Get all products works
- [ ] Get product by ID works
- [ ] Get products by category works
- [ ] Create product (authenticated) works
- [ ] Update product stock (authenticated) works

### Orders Service ✅
- [ ] Get all orders (authenticated) works
- [ ] Create order (authenticated) works
- [ ] Get order by ID (authenticated) works
- [ ] Get orders by user ID works
- [ ] Update order (authenticated) works
- [ ] Delete order (authenticated) works

### Federation ✅
- [ ] Combined queries work
- [ ] Data from multiple services in one query
- [ ] GraphQL federation is functioning

---

## 🐛 Troubleshooting

### Issue: Connection Refused
**Solution:**
```bash
# Check if gateway is running
docker ps | grep federation-gateway

# Start services
docker-compose up -d

# Check logs
docker-compose logs federation-gateway
```

### Issue: "Unauthorized" Error
**Solution:**
1. Run Register or Login request
2. Check that JWT token is saved in environment
3. Verify Authorization header: `Bearer {{jwt_token}}`

### Issue: Service Unhealthy
**Solution:**
```bash
# Check specific service
docker-compose ps

# Restart services
docker-compose restart users-service
docker-compose restart products-service
docker-compose restart orders-service

# View logs
docker-compose logs [service-name]
```

### Issue: GraphQL Syntax Error
**Solution:**
- Use double quotes in GraphQL queries
- Check variable types match schema
- Ensure all required fields are provided
- Validate JSON in variables section

---

## 📊 Expected Test Duration

- Phase 1 (Infrastructure): ~2 minutes
- Phase 2 (Authentication): ~5 minutes
- Phase 3 (Products): ~7 minutes
- Phase 4 (Orders): ~8 minutes
- Phase 5 (Federation): ~3 minutes

**Total: ~25 minutes for complete test suite**

---

## 💡 Tips for Efficient Testing

1. **Use Collection Runner**: Run entire collection automatically
2. **Save Examples**: Save successful responses as examples
3. **Environment Switching**: Create dev/staging/prod environments
4. **Test Scripts**: Add assertions in Test tab
5. **Pre-request Scripts**: Set up test data automatically
6. **Variables**: Use variables for dynamic data (user IDs, order IDs)
7. **Bulk Operations**: Test with Collection Runner for regression testing

---

## ✅ Success Criteria

All tests should pass with:
- ✅ 200/201 status codes for successful operations
- ✅ 204 status code for deletes
- ✅ Valid response structure matching schemas
- ✅ Authentication working correctly
- ✅ JWT tokens automatically managed
- ✅ All services responding through gateway
- ✅ Federation queries combining multiple services

---

**Happy Testing! 🚀**
