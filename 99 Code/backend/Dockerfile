# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only and generate Prisma client
RUN npm ci --omit=dev && \
    npx prisma generate

# Save production node_modules aside
RUN cp -R node_modules /prod_node_modules

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ============================================================
# Stage 2: Build TypeScript source
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy full node_modules (with devDependencies) from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build TypeScript to dist/
RUN npm run build

# ============================================================
# Stage 3: Production image
# ============================================================
FROM node:20-alpine AS production

# Install curl (healthcheck) and dumb-init (PID 1 signal handling)
RUN apk add --no-cache curl dumb-init

WORKDIR /app

# Copy production node_modules
COPY --from=deps /prod_node_modules ./node_modules

# Copy generated Prisma client from deps stage
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema (needed for migrations at runtime)
COPY prisma ./prisma/

# Copy compiled application from build stage
COPY --from=build /app/dist ./dist

# Copy email templates (runtime templates)
COPY emails ./emails/

# Copy package.json (needed for metadata / scripts)
COPY package.json ./

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Healthcheck against the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]

# Start the production server
CMD ["node", "dist/server.js"]
