#!/bin/bash

# Lexara Setup Script
# This script automates the initial setup of the Lexara development environment

set -e

echo "🚀 Welcome to Lexara Setup!"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is $NODE_VERSION. Recommended: 20+${NC}"
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm is not installed. Installing...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✓${NC} pnpm $(pnpm -v)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker $(docker -v)"

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🐳 Starting PostgreSQL..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "🔧 Setting up Backend..."
cd apps/api

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created apps/api/.env"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping...${NC}"
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
pnpm prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
pnpm prisma:migrate || true

# Seed database
echo "🌱 Seeding database with demo data..."
pnpm prisma:seed

cd ../..

echo ""
echo "🎨 Setting up Frontend..."
cd apps/web

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created apps/web/.env.local"
else
    echo -e "${YELLOW}⚠️  .env.local already exists, skipping...${NC}"
fi

cd ../..

echo ""
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "📚 Quick Start:"
echo ""
echo "  1. Start development servers:"
echo "     ${GREEN}pnpm dev${NC}"
echo ""
echo "  2. Access the application:"
echo "     Frontend: ${GREEN}http://localhost:3000${NC}"
echo "     Backend:  ${GREEN}http://localhost:3001${NC}"
echo ""
echo "  3. Demo account:"
echo "     Email:    ${GREEN}demo@lexara.com${NC}"
echo "     Password: ${GREEN}demo123456${NC}"
echo ""
echo "  4. Database GUI:"
echo "     ${GREEN}cd apps/api && pnpm prisma:studio${NC}"
echo ""
echo "📖 Documentation:"
echo "   - README.md         - Project overview"
echo "   - DEVELOPMENT.md    - Developer guide"
echo "   - DEPLOYMENT.md     - Deployment guide"
echo "   - CONTRIBUTING.md   - How to contribute"
echo ""
echo "❓ Need help? Open an issue on GitHub"
echo ""
echo "Happy coding! 🎉"
