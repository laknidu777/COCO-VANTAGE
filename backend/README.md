# COCO-VANTAGE — Backend Service

A robust, enterprise-grade REST API backend foundation for the COCO-VANTAGE e-commerce application built with **Node.js**, **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## 🛠 Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Runtime**: Node.js (v20+ / v24)
- **Language**: TypeScript (v5.7+)
- **Database**: PostgreSQL (v14+)
- **ORM**: [Prisma](https://www.prisma.io/) (v6.19.3)
- **API Documentation**: Swagger / OpenAPI via `@nestjs/swagger`
- **Validation**: `class-validator` & `class-transformer`
- **Testing**: Jest & Supertest

---

## 📋 Prerequisites

Before running the backend, make sure you have:

1. **Node.js**: v20.x or v24.x installed
2. **npm**: v10.x or v11.x installed
3. **PostgreSQL**: A running PostgreSQL instance with a target database created (e.g. `coco_vantage`)

---

## ⚙️ Environment Configuration

The backend reads configuration from either `backend/.env` or the repository root `.env` (using `@nestjs/config` with strict validation via `class-validator`).

A template is provided at the repository root in [`.env.example`](../.env.example):

```env
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coco_vantage?schema=public"

# Application Server
NODE_ENV=development
PORT=4000

# Security & CORS
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# API Configuration
API_PREFIX="api/v1"
SWAGGER_PATH="api/docs"
```

> **Security Note:** Never commit `.env` files containing real database credentials or production secrets. `.env` and `.env.*` are excluded by `.gitignore`.

---

## 📦 Installation

From the repository root or the `backend/` directory:

```bash
cd backend
npm install
```

---

## 🚀 Running the Backend

### Development Mode (with hot reload)
```bash
cd backend
npm run start:dev
```

### Production Build & Run
```bash
cd backend
npm run build
npm run start:prod
```

### Server Endpoints
- **Health Check Endpoint**: [http://localhost:4000/health](http://localhost:4000/health)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Base API Prefix**: `http://localhost:4000/api/v1`

---

## 🗄 Prisma & Database Management

Prisma schema is located centrally at [`prisma/schema.prisma`](../prisma/schema.prisma) and configured for the backend.

### 1. Validate Schema
```bash
npm run prisma:validate
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Migrations (when schema models are added)
```bash
# In development (creates and applies migrations)
npm run prisma:migrate:dev

# In production (applies existing migrations safely)
npm run prisma:migrate:deploy
```

### 4. Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run unit tests
npm test

# Run end-to-end (e2e) tests
npm run test:e2e

# Run linter
npm run lint

# Format code
npm run format
```

---

## 🌐 Running Frontend and Backend Together

The repository structure separates concerns cleanly:
- `backend/`: NestJS REST API server (listening on port 4000 by default)
- `storefront/`: Next.js frontend storefront (listening on port 3000 by default)

To run both concurrently in separate terminal sessions:

### Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

### Terminal 2 (Frontend Storefront):
```bash
cd storefront
npm run dev
```

Both services will communicate seamlessly with CORS pre-configured for `http://localhost:3000`.
