#!/bin/bash

# Script to generate superschema from running subgraphs
# Make sure both auth and notification services are running before executing

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          Federation Gateway - Superschema Generator             ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if services are running
echo "🔍 Checking if subgraph services are running..."
echo ""

# Check auth service
AUTH_URL="${AUTH_SERVICE_URL:-http://localhost:3000/graphql}"
echo "Checking Auth Service at $AUTH_URL..."
if curl -s -X POST "$AUTH_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' > /dev/null 2>&1; then
  echo "✅ Auth Service is running"
else
  echo "❌ Auth Service is not responding at $AUTH_URL"
  echo "   Please start the auth service first: cd auth-micro-service && npm run start:dev"
  exit 1
fi

# Check notification service
NOTIFICATION_URL="${NOTIFICATION_SERVICE_URL:-http://localhost:3002/graphql}"
echo "Checking Notification Service at $NOTIFICATION_URL..."
if curl -s -X POST "$NOTIFICATION_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' > /dev/null 2>&1; then
  echo "✅ Notification Service is running"
else
  echo "❌ Notification Service is not responding at $NOTIFICATION_URL"
  echo "   Please start the notification service first: cd notification-micro-service && npm run start:dev"
  exit 1
fi

echo ""
echo "🔄 Generating superschema..."
echo ""

# Run the generation script
npm run generate:schema

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Superschema Generated!                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📄 File location: $(pwd)/superschema.graphql"
echo ""
echo "You can now use this schema file with:"
echo "  - GraphQL Code Generator"
echo "  - Apollo Client"
echo "  - IDE tooling (GraphQL LSP)"
echo "  - API documentation tools"
echo ""
