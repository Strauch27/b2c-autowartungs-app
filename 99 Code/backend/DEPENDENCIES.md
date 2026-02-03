# Required Dependencies for Authentication System

## Installation Command

Run the following command to install all required dependencies:

```bash
npm install express jsonwebtoken bcryptjs express-rate-limit cors helmet morgan @prisma/client
```

## Development Dependencies

```bash
npm install --save-dev @types/express @types/jsonwebtoken @types/bcryptjs @types/cors @types/morgan typescript ts-node nodemon
```

## Dependency List

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.0 | Web framework |
| `jsonwebtoken` | ^9.0.0 | JWT token generation and verification |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `express-rate-limit` | ^7.0.0 | Rate limiting for API endpoints |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `helmet` | ^7.0.0 | Security headers |
| `morgan` | ^1.10.0 | HTTP request logger |
| `@prisma/client` | ^5.0.0 | Database ORM |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.0.0 | TypeScript compiler |
| `@types/express` | ^4.17.0 | Type definitions for Express |
| `@types/jsonwebtoken` | ^9.0.0 | Type definitions for JWT |
| `@types/bcryptjs` | ^2.4.0 | Type definitions for bcrypt |
| `@types/cors` | ^2.8.0 | Type definitions for CORS |
| `@types/morgan` | ^1.9.0 | Type definitions for Morgan |
| `ts-node` | ^10.9.0 | TypeScript execution for Node.js |
| `nodemon` | ^3.0.0 | Auto-restart server on file changes |

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

## Optional Email Service Dependencies

### Option 1: SendGrid (Recommended)

```bash
npm install @sendgrid/mail
npm install --save-dev @types/sendgrid__mail
```

### Option 2: AWS SES

```bash
npm install @aws-sdk/client-ses
```

### Option 3: Nodemailer (Local Development)

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## TypeScript Configuration

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Prisma Setup

### 1. Initialize Prisma (if not already done)

```bash
npx prisma init
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name add-auth-system
```

### 4. Seed Database (Optional)

Create `prisma/seed.ts` and run:

```bash
npx prisma db seed
```

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the values in `.env` with your actual configuration

3. Never commit `.env` to version control

## Verification

After installing dependencies, verify everything is working:

```bash
# Check TypeScript compilation
npm run build

# Start development server
npm run dev

# Generate Prisma client
npm run prisma:generate
```

## Troubleshooting

### Issue: Module not found errors

**Solution:** Ensure all dependencies are installed:
```bash
npm install
```

### Issue: TypeScript errors

**Solution:** Generate Prisma client:
```bash
npx prisma generate
```

### Issue: Database connection errors

**Solution:** Check `DATABASE_URL` in `.env` file

### Issue: Rate limiter not working

**Solution:** Ensure `express-rate-limit` is installed and imported correctly
