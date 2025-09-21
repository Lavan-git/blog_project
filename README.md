# Professional MERN Blog

A modern, production-ready blog application built with the MERN stack, featuring enterprise-grade architecture, comprehensive testing, and security best practices.

## 🚀 Features

### ✅ **Authentication System**
- **JWT Authentication** with access and refresh tokens
- **Secure password hashing** with bcrypt
- **Rate limiting** for auth endpoints
- **Session management** across multiple devices

### ✅ **Blog Management**
- **CRUD operations** for blog posts
- **Advanced search** with text indexing
- **Tag system** for content organization
- **Pagination** and filtering
- **Rich analytics** and statistics

### ✅ **Security & Performance**
- **Helmet.js** for security headers
- **CORS** configuration
- **MongoDB injection** protection
- **Request validation** with Zod
- **Compression** and caching
- **Professional logging** with Winston

### ✅ **Modern Architecture**
- **TypeScript** throughout the stack
- **Monorepo** with Turborepo
- **Shared types** and validation schemas
- **Clean architecture** with separation of concerns
- **Professional error handling**

### ✅ **Testing & Quality**
- **Comprehensive test suites** (Unit, Integration, E2E)
- **Test containers** for database testing
- **Code coverage** reporting
- **ESLint** and **Prettier** for code quality
- **Commit hooks** with Husky

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd professional-mern-blog
npm install

# 2. Set up environment files (see Environment Setup section below)
# Create packages/backend/.env and packages/frontend/.env

# 3. Start MongoDB (if local)
mongod

# 4. Start backend (Terminal 1)
cd packages/backend
npm run dev

# 5. Start frontend (Terminal 2)
cd packages/frontend
npm run dev

# 6. Visit http://localhost:3000
```

## 📋 Requirements

- **Node.js** >= 20.0.0
- **MongoDB** >= 7.0
- **Docker** (for testing)
- **npm** >= 10.0.0

## 🛠 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd professional-mern-blog
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build shared packages
```bash
npm run build
```

### 4. Environment setup

#### Backend Environment
Create `packages/backend/.env`:
```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/professional-mern-blog

# JWT Secrets (Generate your own for production!)
JWT_ACCESS_SECRET=dev-access-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment
Create `packages/frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Running the Application

### Development Mode

**Option 1: Start both services individually (Recommended for development):**
```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev
```

**Option 2: Using root scripts (if configured):**
```bash
# Start all services
npm run dev

# Or individually
npm run server    # Backend only
npm run client    # Frontend only
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Backend tests
```bash
cd packages/backend
npm test
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:integration # Integration tests only
```

### Frontend tests
```bash
cd packages/frontend
npm test
npm run test:e2e        # End-to-end tests
```

## 📦 Project Structure

```
professional-mern-blog/
├── packages/
│   ├── shared/           # Shared types and validation schemas
│   │   ├── src/
│   │   └── package.json
│   ├── backend/          # Express.js API server
│   │   ├── src/
│   │   │   ├── config/   # Configuration files
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/   # Mongoose models
│   │   │   ├── routes/   # Express routes
│   │   │   ├── services/ # Business logic
│   │   │   ├── utils/    # Utility functions
│   │   │   └── tests/    # Test files
│   │   └── package.json
│   └── frontend/         # React application
│       ├── src/
│       └── package.json
├── turbo.json           # Turborepo configuration
└── package.json         # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout-all` - Logout from all devices

### Blog Posts
- `GET /api/posts` - Get posts (with pagination and filters)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/stats` - Get user statistics

### System
- `GET /health` - Health check
- `GET /api` - API information

## 🔒 Security Features

- **JWT Authentication** with short-lived access tokens
- **Refresh token rotation** for enhanced security
- **Rate limiting** to prevent abuse
- **Input validation** with comprehensive schemas
- **MongoDB injection protection**
- **CORS** configuration
- **Security headers** with Helmet.js
- **Request/response logging** for monitoring

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints with real database
- **Authentication Tests**: JWT token validation
- **Validation Tests**: Input validation schemas

### Frontend Testing
- **Component Tests**: React component rendering
- **Hook Tests**: Custom React hooks
- **Integration Tests**: User interactions
- **E2E Tests**: Complete user workflows

## 📊 Performance & Monitoring

- **Request logging** with Winston
- **Error tracking** and reporting
- **Performance metrics** collection
- **Database query optimization**
- **Response compression**
- **Memory usage monitoring**

## 🚀 Deployment

### Quick Deployment Options

#### Option 1: Railway (Recommended)
1. **Frontend**: Deploy to Railway using Node.js buildpack
2. **Backend**: Deploy to Railway with MongoDB addon
3. **Database**: Use Railway MongoDB or MongoDB Atlas

#### Option 2: Vercel + Railway
1. **Frontend**: Deploy to Vercel (free tier)
2. **Backend**: Deploy to Railway
3. **Database**: MongoDB Atlas (free tier)

#### Option 3: Render
1. **Frontend**: Static site deployment
2. **Backend**: Web service deployment
3. **Database**: MongoDB Atlas

### Production Environment Setup

#### Backend Environment (.env)
```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/professional-mern-blog

# JWT Secrets (Generate strong secrets for production!)
JWT_ACCESS_SECRET=your-production-access-secret-256-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-256-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# CORS (Update with your production domain)
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend Environment (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Docker Support
```bash
# Build and run with Docker
docker-compose up --build
```

### Deployment Checklist
- [ ] Update JWT secrets with strong production values
- [ ] Set up MongoDB connection string (Atlas recommended)
- [ ] Configure CORS origins for production domain
- [ ] Set NODE_ENV=production
- [ ] Update API URLs in frontend environment
- [ ] Test all functionality in staging environment
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database

### Build Commands for Deployment Platforms

**Frontend (Static Deployment):**
```bash
# Build command
npm run build

# Output directory
packages/frontend/dist
```

**Backend (Node.js Deployment):**
```bash
# Build command
npm run build

# Start command
npm start

# Entry point
packages/backend/dist/server.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Zod** for validation
- **Winston** for logging
- **Jest** for testing

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **React Hook Form** for forms

### DevOps & Tools
- **Turborepo** for monorepo management
- **Docker** for containerization
- **ESLint** & **Prettier** for code quality
- **Husky** for git hooks
- **GitHub Actions** for CI/CD

## 📈 Performance Benchmarks

- **API Response Time**: < 100ms average
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: < 100MB for typical workloads
- **Test Coverage**: > 90% for critical paths

---

**Built with ❤️ using modern web technologies and best practices**
