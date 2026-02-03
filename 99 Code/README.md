# B2C Autowartungs-App

Professionelle Fahrzeugwartung mit Hol- und Bringservice - Full-Stack Application

## Project Structure

```
99 Code/
├── frontend/          # Next.js 14+ with App Router
│   ├── app/
│   │   ├── (landing)/      # Landing page (route group)
│   │   ├── (customer)/     # Customer portal
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   ├── (jockey)/       # Jockey portal
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   └── (workshop)/     # Workshop portal
│   │       ├── login/
│   │       └── dashboard/
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── shared/         # Shared components
│   │   ├── customer/       # Customer-specific components
│   │   ├── jockey/         # Jockey-specific components
│   │   └── workshop/       # Workshop-specific components
│   ├── lib/
│   │   ├── api/            # API client utilities
│   │   ├── utils/          # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── validators/     # Zod schemas for validation
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Type definitions
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── README.md
```

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Validation:** Zod
- **State Management:** React Context (to be implemented)

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Magic Link
- **Email:** Nodemailer
- **Logging:** Winston
- **Validation:** Zod + express-validator

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd "/Users/stenrauch/Documents/B2C App v2/99 Code"
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Setup Database**

   Create a PostgreSQL database:
   ```bash
   createdb autowartungs_app
   ```

5. **Configure Environment Variables**

   **Backend (.env):**
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - Database connection string
   - JWT secret
   - Email service credentials
   - Frontend URL

   **Frontend (.env.local):**
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and configure:
   - API URL (backend URL)

6. **Run Database Migrations**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

7. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

### Running the Application

**Development Mode:**

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:3000

3. **Open Browser**
   Navigate to http://localhost:3000

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with watch mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with test data

## Multi-Portal Architecture

The application has three separate portals:

### 1. Customer Portal (`/customer/*`)
- **Login:** Magic Link (passwordless)
- **Features:**
  - Vehicle selection
  - Service booking
  - Price calculation
  - Payment processing
  - Booking management

### 2. Jockey Portal (`/jockey/*`)
- **Login:** Username + Password
- **Features:**
  - View assigned pickups/deliveries
  - Update job status
  - Vehicle handover documentation

### 3. Workshop Portal (`/workshop/*`)
- **Login:** Username + Password
- **Features:**
  - Manage bookings
  - Update service status
  - Capacity management
  - Time slot management

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **User** - Multi-role user model (Customer, Jockey, Workshop, Admin)
- **CustomerProfile** - Customer-specific data
- **JockeyProfile** - Jockey-specific data
- **WorkshopProfile** - Workshop-specific data
- **Session** - Authentication sessions
- **Vehicle** - Vehicle information with required fields (brand, model, year, mileage)
- **PriceMatrix** - Dynamic pricing based on vehicle make/model
- **Booking** - Service bookings with full lifecycle
- **TimeSlot** - Workshop capacity management

## Authentication

- **Customers:** Magic Link (email-based, passwordless)
- **Jockeys:** Username/Password with bcrypt hashing
- **Workshops:** Username/Password with bcrypt hashing
- **Sessions:** JWT-based with httpOnly cookies

## Sprint 1 Objectives

From `02 Planning/16_Sprint_01_Plan.md`:

- Landing page with three login areas
- Multi-portal authentication (Customer, Jockey, Workshop)
- Vehicle selection with required fields
- Price calculation based on PriceMatrix
- Service selection
- Basic booking flow

## Development Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow ESLint rules
   - Use Prettier for formatting
   - Write clean, self-documenting code

2. **Components**
   - Keep components small and focused
   - Use composition over inheritance
   - Implement proper error handling

3. **API Design**
   - RESTful endpoints
   - Consistent error responses
   - Proper HTTP status codes
   - Request validation

4. **Database**
   - Use Prisma migrations
   - Never modify schema directly
   - Always use transactions for multi-step operations

## Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

**Port Already in Use:**
- Backend: Change PORT in .env
- Frontend: Use `npm run dev -- -p 3001`

**Prisma Client Not Generated:**
```bash
cd backend
npm run db:generate
```

**Missing Dependencies:**
```bash
cd frontend && npm install
cd backend && npm install
```

## Next Steps

After setup:
1. Verify all three login pages are accessible
2. Check health endpoint: http://localhost:5000/health
3. Start implementing authentication endpoints (Sprint 1)
4. Add shadcn/ui components as needed
5. Implement vehicle selection flow
6. Integrate Stripe for payments (Post-MVP)

## Project Team

- **Product Owner:** Sten Rauch
- **Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Express, PostgreSQL, Prisma

## License

MIT

---

**Last Updated:** 2026-02-01
