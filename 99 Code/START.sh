#!/bin/bash

# B2C Autowartungs-App - Startup Script
# This script starts the entire application using Docker Compose

set -e

echo "🚀 Starting B2C Autowartungs-App..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to the 99 Code directory
cd "$(dirname "$0")"

echo "📦 Building containers..."
docker-compose build

echo ""
echo "🚢 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Wait for backend to be healthy
echo "   Checking backend health..."
max_attempts=30
attempt=0
until docker-compose exec -T backend curl -f http://localhost:5000/health > /dev/null 2>&1 || [ $attempt -eq $max_attempts ]; do
    echo "   Backend not ready yet... (attempt $((attempt+1))/$max_attempts)"
    sleep 2
    attempt=$((attempt+1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Backend failed to start. Check logs with: docker-compose logs backend"
    exit 1
fi

echo ""
echo "✅ All services started successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 B2C Autowartungs-App is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:5000"
echo "🗄️  Database:  localhost:5432"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Test Accounts:"
echo ""
echo "  👤 Customer:"
echo "     Email: kunde@test.de"
echo "     (Use Magic Link login)"
echo ""
echo "  🚗 Jockey:"
echo "     Username: jockey1"
echo "     Password: password123"
echo ""
echo "  🔧 Workshop:"
echo "     Username: workshop1"
echo "     Password: password123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Useful Commands:"
echo ""
echo "  View logs:          docker-compose logs -f"
echo "  Stop services:      docker-compose down"
echo "  Restart:            docker-compose restart"
echo "  Database shell:     docker-compose exec postgres psql -U b2c_user -d autowartungs_app"
echo "  Backend shell:      docker-compose exec backend sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Try the Customer login with: kunde@test.de"
echo "  3. Test the vehicle selection form"
echo "  4. Check the service pricing"
echo ""
echo "Happy coding! 🚀"
