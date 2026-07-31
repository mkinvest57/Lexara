#!/bin/bash

# Immerli local setup

set -e

echo "Setting up Immerli..."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22.13 or newer is required."
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Node.js 22.13 or newer is required; found $(node -v)."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm 9 or newer is required. Enable Corepack or install pnpm first."
  exit 1
fi

pnpm install

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
fi

if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
fi

pnpm --filter @immerli/api prisma:generate
pnpm --filter @immerli/api prisma:seed

echo "Immerli is ready. Run: pnpm dev"
echo "Web: http://localhost:3000"
echo "API: http://localhost:3001/api"
echo "Demo: demo@immerli.com / demo123456"
