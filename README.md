# 🚀 Full-Stack GraphQL Federation Microservices Application

A modern, production-ready full-stack application built with **React**, **TypeScript**, **NestJS**, and **Apollo GraphQL Federation**. Features comprehensive authentication, user management, and automatic token refresh for seamless user experience.

## ✨ Key Features

### 🔐 **Advanced Authentication System**
- **JWT-based authentication** with RS256 algorithm
- **Refresh token implementation** for persistent sessions
- **Automatic token refresh** - users never get logged out unexpectedly
- **Remember Me feature** - stay logged in for 7 or 30 days
- **Protected routes** with seamless redirect handling
- **Access tokens**: 15 minutes (security)
- **Refresh tokens**: 7 days (default) or 30 days (with Remember Me)

### 🎨 **Modern React Frontend**
- **React 19** with **TypeScript**
- **Apollo Client 3** with intelligent error handling
- **GraphQL Code Generator** for type-safe queries/mutations
- **React Router v7** for navigation
- **Responsive design** with modern CSS
- **Professional UI/UX** with gradient backgrounds and card layouts
- **Real-time error handling** and loading states

### 🏗️ **Microservices Architecture**
- **Apollo Federation Gateway** for unified GraphQL API
- **Users Service** - Authentication and user management
- **Products Service** - Product catalog (extensible)
- **Orders Service** - Order management (extensible)
- **Fully federated** GraphQL schema

### 🛠️ **User Management (CRUD)**
- View user profile dashboard
- List all users in a table
- Create new users via registration
- Update user details
- Delete users with confirmation
- Role-based access control ready

### 🔄 **Automatic Token Refresh**
- Detects expired tokens automatically
- Refreshes tokens in the background
- Retries failed requests seamlessly
- Handles concurrent requests during refresh
- Zero interruption to user experience

### 📱 **Responsive Design**
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts for all screen sizes
- Modern color scheme with CSS variables

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                    │
│  - Apollo Client with Error Link for Auto Token Refresh     │
│  - TypeScript + GraphQL Code Generator                      │
│  - Protected Routes + Auth Context                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ GraphQL over HTTP
┌─────────────────────────────────────────────────────────────┐
│              Apollo Federation Gateway (Port 4000)           │
│  - Unified GraphQL Schema                                   │
│  - JWT Authentication Plugin                                │
│  - CORS Configuration                                       │
└────────────┬──────────────────────┬─────────────────────────┘
             │                      │
             ↓                      ↓
┌────────────────────┐  ┌────────────────────┐  ┌─────────────┐
│   Users Service    │  │ Products Service   │  │   Orders    │
│   (Port 3001)      │  │   (Port 3002)      │  │  Service    │
│ - Auth & Users     │  │ - Product Catalog  │  │ (Port 3003) │
│ - JWT Generation   │  │ - Federated Schema │  │ - REST API  │
│ - Token Refresh    │  │ - GraphQL          │  │             │
└────────────────────┘  └────────────────────┘  └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd <project-folder>

# Install dependencies for all services
cd users-service && npm install
cd ../products-service && npm install
cd ../orders-service && npm install
cd ../federation-gateway && npm install
cd ../frontend && npm install

# Configure environment variables
# Update federation-gateway/.env with localhost URLs

# Start all services (in separate terminals)
cd users-service && npm start       # Port 3001
cd products-service && npm start    # Port 3002
cd orders-service && npm start      # Port 3003
cd federation-gateway && npm start  # Port 4000
cd frontend && npm run dev          # Port 5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- **GraphQL Playground**: http://localhost:4000/graphql
- **Default Credentials**: 
  - Email: `test@example.com`
  - Password: `password123`

## 📂 Project Structure

```
.
├── frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/              # Login, Register, Dashboard, Users, EditUser
│   │   ├── components/         # ProtectedRoute
│   │   ├── context/            # AuthContext for state management
│   │   ├── lib/                # Apollo Client, Token Refresh logic
│   │   ├── graphql/            # Queries and Mutations
│   │   └── generated/          # Auto-generated TypeScript types
│   ├── codegen.ts              # GraphQL Code Generator config
│   └── vite.config.ts          # Vite configuration with proxy
│
├── federation-gateway/          # Apollo Federation Gateway
│   └── src/
│       ├── auth/               # JWT authentication plugin
│       ├── config/             # Configuration service
│       └── proxy/              # REST API proxies
│
├── users-service/              # User & Auth microservice
│   └── src/
│       ├── auth/               # Login, Register, Refresh Token
│       └── users/              # User CRUD operations
│
├── products-service/           # Products microservice
│   └── src/
│       └── products/           # Product management
│
└── orders-service/             # Orders microservice
    └── src/
        └── orders/             # Order management
```

## 🎯 Key Technologies

### Frontend
- **React 19.2** - Modern UI framework
- **TypeScript 5.9** - Type safety
- **Apollo Client 3.8** - GraphQL client with caching
- **React Router 7.13** - Client-side routing
- **GraphQL Code Generator** - Auto-generated types and hooks
- **Vite 7.2** - Lightning-fast build tool

### Backend
- **NestJS 10** - Progressive Node.js framework
- **Apollo Server** - GraphQL server
- **Apollo Federation** - Microservices composition
- **TypeScript** - Type-safe backend
- **JWT (jsonwebtoken)** - Authentication with RS256
- **TypeORM** - Database ORM (configurable)

## 🔐 Security Features

- ✅ **RS256 JWT tokens** with public/private key pairs
- ✅ **Short-lived access tokens** (15 minutes) minimize exposure
- ✅ **Long-lived refresh tokens** (7-30 days) for convenience
- ✅ **Automatic token rotation** on refresh
- ✅ **Token revocation** ready (refresh token stored per user)
- ✅ **CORS configured** for cross-origin requests
- ✅ **Protected GraphQL operations** with auth guards
- ✅ **Error handling** prevents token leakage

## 📖 API Documentation

### Authentication Mutations

```graphql
# Register a new user
mutation Register {
  register(input: { 
    name: "John Doe"
    email: "john@example.com"
    password: "securepass123"
    role: "user"
  }) {
    accessToken
    refreshToken
    user { id name email role }
  }
}

# Login
mutation Login {
  login(input: { 
    email: "john@example.com"
    password: "securepass123"
    rememberMe: true
  }) {
    accessToken
    refreshToken
    user { id name email role }
  }
}

# Refresh access token
mutation RefreshToken {
  refreshToken(input: { 
    refreshToken: "your_refresh_token"
  }) {
    accessToken
    refreshToken
    user { id name email role }
  }
}
```

### User Queries & Mutations

```graphql
# Get current user
query GetMe {
  me {
    id name email role createdAt
  }
}

# Get all users
query GetUsers {
  users {
    id name email role createdAt
  }
}

# Update user
mutation UpdateUser {
  updateUser(id: "1", input: { 
    name: "Jane Doe"
    email: "jane@example.com"
  }) {
    id name email role
  }
}

# Delete user
mutation DeleteUser {
  deleteUser(id: "1")
}
```

## 🎨 UI Features

- **Gradient authentication pages** with modern design
- **Card-based layouts** for content organization
- **Responsive tables** for user management
- **Form validation** with helpful error messages
- **Loading states** for async operations
- **Success/error notifications** with color coding
- **Mobile-responsive** design with breakpoints
- **Hover effects** and smooth transitions

## 🧪 Testing

```bash
# Test authentication flow
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: { email: \"test@example.com\", password: \"password123\" }) { accessToken refreshToken user { id name } } }"}'

# Test token refresh
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { refreshToken(input: { refreshToken: \"YOUR_TOKEN\" }) { accessToken user { id } } }"}'
```

## 🚧 Roadmap

### Planned Features
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] User avatar upload
- [ ] Admin dashboard with analytics
- [ ] Activity logs and audit trail
- [ ] Rate limiting for API endpoints
- [ ] WebSocket subscriptions for real-time updates
- [ ] Unit and E2E tests
- [ ] Docker Compose for easy deployment
- [ ] CI/CD pipeline configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Apollo GraphQL** - For the excellent GraphQL implementation
- **NestJS** - For the amazing Node.js framework
- **React Team** - For the best UI library
- **TypeScript** - For making JavaScript better

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**⭐ Star this repository if you find it helpful!**

Built with ❤️ using React, TypeScript, NestJS, and GraphQL
