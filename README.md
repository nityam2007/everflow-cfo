# EverflowCFO

**Payroll Credit Pre-Assessment & Lead Orchestration Platform**

A production-grade lead qualification and orchestration platform built with Next.js 15, PostgreSQL, and Redis.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Check services are running
docker-compose ps
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📧 Default Login Credentials

After seeding:

### Staff Portal (`/login`)
| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@everflowcfo.com   | admin123   |
| Staff | staff@everflowcfo.com   | staff123   |

### Client Portal (`/login` → Partner Login tab)
| Client                | Email               | Password   |
|-----------------------|---------------------|------------|
| Sunrise Technologies  | mchen@oceanview.com | client123  |
| OceanView Resort      | mchen@oceanview.com | client123  |
| Metro Dining Group    | arodriguez@metro.com | client123 |
| Heritage Manufacturing| bwilliams@heritage.com | client123 |
| Peak Hospitality      | ejohnson@peak.com   | client123  |

## 👥 User Roles

| Role   | Description                                      |
|--------|--------------------------------------------------|
| ADMIN  | Full access - manages staff, clients, settings   |
| STAFF  | Manages assigned leads, updates status           |
| CLIENT | Views own applications via partner portal        |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth.js handlers
│   │   └── leads/        # Lead management endpoints
│   ├── dashboard/        # Protected admin/staff pages
│   │   ├── leads/        # Lead list & detail views
│   │   └── settings/     # Admin settings
│   ├── estimator/        # Public estimator wizard
│   ├── login/            # Authentication page
│   └── results/          # Public results page
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts           # Auth.js v5 configuration
│   ├── auth-utils.ts     # Auth helper functions
│   ├── db.ts             # Prisma client
│   ├── estimation-engine.ts  # Credit calculation logic
│   ├── redis.ts          # Redis client & cache utils
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Zod schemas
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Seed data
```

## 🔧 Available Scripts

| Command           | Description                      |
|-------------------|----------------------------------|
| `npm run dev`     | Start dev server with Turbopack |
| `npm run build`   | Production build                 |
| `npm run start`   | Start production server          |
| `npm run lint`    | Run ESLint                       |
| `npm run db:generate` | Generate Prisma client       |
| `npm run db:push` | Push schema to database          |
| `npm run db:migrate` | Run migrations (production)   |
| `npm run db:studio` | Open Prisma Studio             |
| `npm run db:seed` | Seed database                    |
| `npm run docker:up` | Start Docker services          |
| `npm run docker:down` | Stop Docker services         |

## 🛡️ Security Features

- **Role-based access control** (Admin/Staff)
- **Password hashing** with bcrypt
- **Rate limiting** via Redis
- **CSRF protection** built into Auth.js
- **Audit logging** for all lead actions
- **Input validation** with Zod

## 📊 Tech Stack

- **Framework:** Next.js 15.3 (App Router, Server Components)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4.1
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.2
- **Cache:** Redis 7
- **Auth:** Auth.js (NextAuth v5)
- **Validation:** Zod
- **UI Components:** Radix UI

## 🎨 Design System

The UI follows a dark, institutional design palette inspired by private equity and banking interfaces:

- **Background:** Deep black (#0a0a0b)
- **Cards:** Dark gray (#111113)
- **Accent:** Institutional gold (#c9a227)
- **Typography:** System fonts for performance

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://everflow:everflow_secure_2024@localhost:5432/everflowcfo?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
AUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NODE_ENV="development"
```

## 🔄 Lead Lifecycle

```
New → Assigned → In Progress → Closed / Lost
```

Every status transition is timestamped and auditable.

## 📈 Estimation Engine

The credit estimation engine uses rule-based logic with:

- **TIP:** FICA Tip Credit (restaurants/hospitality)
- **WOTC:** Work Opportunity Tax Credit
- **R&D:** Research & Development Tax Credit

All estimates are conservative and statutory-capped.

## 🚫 Non-Goals (Explicit)

This is **NOT**:
- A payroll processor
- Tax filing software
- Document upload system
- AI-based estimation

## 📄 License

Private - All rights reserved.




BTN to stripe workflow  
-- 
so btn click : form for name email and phone (make lead as unpaid )- > go to stripe -> make account() -> thankyou

User clicks "Buy Now" on Pricing Card
         ↓
┌─────────────────────────────────────┐
│   Customer Info Modal               │
│   ┌─────────────────────────────┐   │
│   │ Full Name *                 │   │
│   │ Email Address *             │   │
│   │ Phone Number *              │   │
│   │ Company Name (optional)     │   │
│   └─────────────────────────────┘   │
│   [Continue to Payment →]           │
└─────────────────────────────────────┘
         ↓
POST /api/leads/checkout
  → Creates Partner (client account)
  → Creates Lead with status=NEW, source="Checkout - {Product}"
  → Returns leadId
         ↓
POST /api/create-checkout-session
  → Passes customer email, name, phone, leadId in metadata
  → Stripe collects billing address + card
         ↓
Stripe Checkout Page
  → Card info only (customer details pre-filled)
         ↓
Payment Success → Webhook called
  → Updates Partner with Stripe data
  → Creates Payment record with all customer info
  → Updates Lead status to IN_PROGRESS
         ↓
/payment/success - Thank You Page