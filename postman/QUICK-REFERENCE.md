# Quick Reference Guide - Federation Gateway API Testing

## 🚀 Quick Start (3 Steps)

### Step 1: Import into Postman
```
Import → Select Files → Choose both .json files → Import
```

### Step 2: Select Environment
```
Top-right dropdown → "Federation Gateway - Local"
```

### Step 3: Test!
```
Health Checks → Gateway Health Check → Send
```

---

## 📋 Essential Endpoints Cheat Sheet

### Gateway Base URL
```
http://localhost:4000
```

### Health & Status
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | ❌ | Overall health |
| `/health/services` | GET | ❌ | Services status |
| `/graphql` | POST | Varies | GraphQL endpoint |

---

## 🔐 Authentication Flow

### 1️⃣ Register New User
**Endpoint:** `POST /graphql`
```graphql
mutation {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "SecurePass123!"
    role: "user"
  }) {
    token
    user { id name email }
  }
}
```
✅ Token auto-saved to `{{jwt_token}}`

### 2️⃣ Login Existing User
**Endpoint:** `POST /graphql`
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "SecurePass123!"
  }) {
    token
    user { id name email }
  }
}
```
✅ Token auto-saved to `{{jwt_token}}`

### 3️⃣ Get My Profile
**Endpoint:** `POST /graphql`
**Headers:** `Authorization: Bearer {{jwt_token}}`
```graphql
query {
  me {
    id
    name
    email
    role
    createdAt
  }
}
```

---

## 👥 Users Service (GraphQL)

| Operation | Auth | Query |
|-----------|------|-------|
| Get all users | ❌ | `query { users { id name email } }` |
| Get user by ID | ❌ | `query { user(id: "1") { id name email } }` |
| Get by email | ❌ | `query { userByEmail(email: "test@test.com") { id name } }` |
| Get my profile | ✅ | `query { me { id name email role } }` |
| Create user | ❌ | `mutation { createUser(name: "Jane", email: "jane@test.com") { id } }` |

---

## 📦 Products Service (GraphQL)

| Operation | Auth | Query |
|-----------|------|-------|
| Get all products | ❌ | `query { products { id name price stock } }` |
| Get product by ID | ❌ | `query { product(id: "1") { id name price } }` |
| Get by category | ❌ | `query { productsByCategory(category: "Electronics") { id name } }` |
| Create product | ✅ | `mutation { createProduct(name: "Laptop", description: "...", price: 999, stock: 10, category: "Electronics") { id } }` |
| Update stock | ✅ | `mutation { updateProductStock(id: "1", quantity: -5) { id stock } }` |

---

## 🛒 Orders Service (REST API)

**Base Path:** `/api/orders`

| Operation | Method | Auth | Endpoint | Body |
|-----------|--------|------|----------|------|
| Get all orders | GET | ✅ | `/api/orders` | - |
| Get user orders | GET | ✅ | `/api/orders?userId=1` | - |
| Get order by ID | GET | ✅ | `/api/orders/:id` | - |
| Create order | POST | ✅ | `/api/orders` | See below ⬇️ |
| Update order | PUT | ✅ | `/api/orders/:id` | See below ⬇️ |
| Delete order | DELETE | ✅ | `/api/orders/:id` | - |

### Create Order Body
```json
{
  "userId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 1299.99
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345"
}
```

### Update Order Body
```json
{
  "status": "shipped",
  "shippingAddress": "456 Oak Ave, City, State 12345"
}
```

**Valid Status Values:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

---

## 🔗 Federated Query Examples

### Combined User + Products
```graphql
query {
  me {
    id
    name
    email
  }
  products {
    id
    name
    price
    category
  }
}
```

### All Users + All Products
```graphql
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
    stock
  }
}
```

---

## 🔑 Headers Reference

### GraphQL Requests
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}    # Only for protected queries/mutations
```

### REST Requests (Orders)
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}    # Required for ALL orders endpoints
```

---

## ⚡ Testing Sequence

### Complete Test Flow
```
1. Health Check              → Verify services
2. Register User             → Get JWT token
3. Get My Profile            → Test auth
4. Get All Products          → Test products service
5. Create Product            → Test authenticated mutation
6. Get All Orders            → Test orders REST API
7. Create Order              → Place test order
8. Get Orders by User        → Verify order created
9. Update Order              → Change status to "shipped"
10. Get Order by ID          → Verify update
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Unauthorized" error | 1. Login/Register<br>2. Check token is saved<br>3. Check Authorization header |
| Connection refused | 1. Start gateway: `docker-compose up`<br>2. Check port 4000 is available |
| Service unavailable | 1. Run health check<br>2. Restart services: `docker-compose restart` |
| GraphQL syntax error | 1. Check quotes (use double quotes)<br>2. Verify variable types<br>3. Check required fields |
| Token expired | Re-run Login request to get new token |

---

## 📊 Environment Variables

| Variable | Usage | Set By |
|----------|-------|--------|
| `{{gateway_url}}` | Gateway base URL | Manual/Environment |
| `{{jwt_token}}` | Auth token | Auto (login/register) |
| `{{test_user_email}}` | Default email | Environment |
| `{{test_user_password}}` | Default password | Environment |
| `{{test_user_id}}` | Default user ID | Environment |

---

## 💡 Pro Tips

1. **Auto-save tokens**: Login/Register automatically save JWT to environment
2. **Use variables**: Reference with `{{variable_name}}`
3. **Collection Runner**: Test multiple requests sequentially
4. **GraphQL Playground**: Also available at `http://localhost:4000/graphql`
5. **Save examples**: Save successful responses as examples for documentation
6. **Organize tests**: Use folders to group related requests
7. **Pre-request scripts**: Add setup logic before requests
8. **Test scripts**: Add assertions to validate responses

---

## 🎯 Quick Commands

### View Collection in Postman
```
Collection: "Federation Gateway API"
Environment: "Federation Gateway - Local"
```

### Export Results
```
Collection Runner → Run Collection → Export Results
```

### Generate Code
```
Select Request → Code (</>) → Choose Language
```

### Share Collection
```
Collection Menu (⋮) → Share → Via Link/JSON
```

---

## 📱 GraphQL Playground Alternative

Access the interactive GraphQL playground:
```
http://localhost:4000/graphql
```

**Add auth header in playground:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

---

## 🔍 Sample Test Data

### Users
```
Name: John Doe
Email: john.doe@example.com
Password: SecurePassword123!
Role: user
```

### Products
```
Name: Laptop
Description: High-performance laptop
Price: 1299.99
Stock: 50
Category: Electronics
```

### Orders
```
User ID: 1
Product IDs: 1, 2
Quantities: 2, 1
Address: 123 Main St, New York, NY 10001
```

---

## 📞 Support

- **Documentation**: `/docs` folder
- **Service Docs**: Check individual service READMEs
- **Issues**: Review logs with `docker-compose logs [service-name]`

---

**Ready to test? Start with the Health Check! 🚀**
