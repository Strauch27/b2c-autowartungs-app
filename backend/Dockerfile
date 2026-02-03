# Backend Dockerfile for Development
FROM node:20-alpine

# Install necessary tools
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
