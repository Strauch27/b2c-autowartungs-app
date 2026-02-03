# Setup Guide - B2C Autowartungs-App

Complete setup instructions for the B2C Autowartungs-App with Next.js 14+ and Express backend.

## Project Overview

This is a full-stack application with:
- **Frontend:** Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend:** Node.js + Express with TypeScript, PostgreSQL, Prisma ORM
- **Architecture:** Multi-portal (Customer, Jockey, Workshop)

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and npm installed
- **PostgreSQL 14+** installed and running
- **Git** installed
- A code editor (VS Code recommended)

## Quick Start

### 1. Navigate to Code Directory

```bash
cd "/Users/stenrauch/Documents/B2C App v2/99 Code"
```

### 2. Install Dependencies

Install both frontend and backend dependencies:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Setup PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using psql
createdb autowartungs_app

# Or via psql command line
psql postgres
CREATE DATABASE autowartungs_app;
\q
```

### 4. Configure Environment Variables

#### Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update the following:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/autowartungs_app?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-min-32-characters"
MAGIC_LINK_SECRET="your-magic-link-secret-change-this-min-32-characters"
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

#### Frontend Environment

```bash
cd ../frontend
cp .env.local.example .env.local
```

The default configuration should work:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 5. Setup Database Schema

Run Prisma migrations to create the database schema:

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 6. Start the Application

Open **two terminal windows**:

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
Environment: development
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
```

### 7. Access the Application

Open your browser and navigate to:

**http://localhost:3000**

You should see the landing page with three portals:
- Customer Portal
- Jockey Portal
- Workshop Portal

## Test Credentials

After running the seed script, you have the following test accounts:

### Customer Portal (Magic Link)
- **Email:** `kunde@test.de`
- **Login Method:** Magic Link (email-based, passwordless)
- **Note:** In development, check console logs for the magic link

### Jockey Portal
- **Username:** `jockey1`
- **Password:** `password123`

### Workshop Portal
- **Username:** `workshop1`
- **Password:** `password123`

## Project Structure

```
99 Code/
├── frontend/                    # Next.js 14+ Application
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── (customer)/         # Customer portal routes
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   ├── (jockey)/           # Jockey portal routes
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   └── (workshop)/         # Workshop portal routes
│   │       ├── login/
│   │       └── dashboard/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── shared/             # Shared components
│   ├── lib/
│   │   ├── api/                # API client
│   │   └── utils/              # Utility functions
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── server.ts           # Entry point
│   │   ├── config/             # Configuration
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes (to be implemented)
│   │   ├── controllers/        # Request handlers (to be implemented)
│   │   ├── services/           # Business logic (to be implemented)
│   │   └── types/              # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Database seeding script
│   └── package.json
│
└── README.md                    # Main documentation
```

## Available Scripts

### Frontend Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Scripts

```bash
npm run dev          # Start development server with hot reload (localhost:5000)
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests

# Database Scripts
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma Client
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database (WARNING: deletes all data)
npm run db:push      # Push schema changes without migrations
```

## Next Steps - Sprint 1 Implementation

Now that the project is set up, the next steps are:

### 1. Authentication Implementation
- Implement Magic Link authentication for customers
- Implement username/password authentication for Jockey & Workshop
- Add JWT token generation and validation
- Create protected route middleware

### 2. Vehicle Selection
- Create vehicle selection form
- Implement brand/model dropdown with data from PriceMatrix
- Add validation for year and mileage

### 3. Price Calculation
- Implement price calculation service
- Create API endpoint for price calculation
- Display price on frontend

### 4. Service Selection
- Create service selection UI
- Integrate with price calculation

Refer to `02 Planning/16_Sprint_01_Plan.md` for detailed sprint objectives and tasks.

## Troubleshooting

### Database Connection Error

**Error:** `Error: Can't reach database server`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env`
3. Ensure database exists: `psql -l | grep autowartungs_app`

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npm run db:generate
```

### Migration Failed

**Error:** Migration failed

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Or manually drop and recreate
dropdb autowartungs_app
createdb autowartungs_app
npm run db:migrate
```

### ESLint Errors

**Solution:**
```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint
```

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- TypeScript Vue Plugin (Volar)

### Prisma Studio

View and edit database data with Prisma Studio:

```bash
cd backend
npm run db:studio
```

Opens at http://localhost:5555

### API Testing

Test backend endpoints using:
- **Postman** or **Insomnia** (GUI)
- **curl** (command line)
- **Thunder Client** (VS Code extension)

Example health check:
```bash
curl http://localhost:5001/health
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment
2. Update DATABASE_URL to production database
3. Set secure JWT_SECRET (min 32 characters)
4. Configure email service (SendGrid or SMTP)
5. Build frontend: `npm run build`
6. Build backend: `npm run build`
7. Run migrations: `npm run db:migrate:prod`

## Support

For issues or questions:
1. Check this setup guide
2. Review `README.md`
3. Check Sprint 01 Plan: `02 Planning/16_Sprint_01_Plan.md`
4. Review existing code in `99 Code/`

## License

MIT

---

**Last Updated:** 2026-02-01
**Setup Status:** Complete - Ready for Sprint 1 Development
