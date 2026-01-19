#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAYPAL_DIR="$(dirname "$SCRIPT_DIR")"
STRIPE_DIR="$(dirname "$PAYPAL_DIR")/stripe"

echo "Copying and adapting files from Stripe app to PayPal app..."
echo "Stripe dir: $STRIPE_DIR"
echo "PayPal dir: $PAYPAL_DIR"

# Function to copy and replace content
copy_and_replace() {
    local src="$1"
    local dest="$2"

    if [ ! -f "$src" ]; then
        echo "Warning: Source file does not exist: $src"
        return
    fi

    mkdir -p "$(dirname "$dest")"

    # Copy and replace Stripe references with PayPal
    sed -e 's/stripe/paypal/g' \
        -e 's/Stripe/PayPal/g' \
        -e 's/STRIPE/PAYPAL/g' \
        -e 's/StripeEnv/PayPalEnv/g' \
        -e 's/stripeEnv/paypalEnv/g' \
        -e 's/TEST/SANDBOX/g' \
        -e 's/"LIVE"/"LIVE"/g' \
        -e 's/payment-paypal/payment-paypal/g' \
        -e 's/PayPalPaymentIntentId/PayPalOrderId/g' \
        -e 's/paymentIntent/order/g' \
        -e 's/PaymentIntent/Order/g' \
        -e 's/payment_intent/order/g' \
        -e 's/RestrictedKey/ClientSecret/g' \
        -e 's/restrictedKey/clientSecret/g' \
        -e 's/PublishableKey/ClientId/g' \
        -e 's/publishableKey/clientId/g' \
        -e 's/pk_test/sandbox/g' \
        -e 's/pk_live/live/g' \
        -e 's/rk_test/sandbox/g' \
        -e 's/rk_live/live/g' \
        -e 's/WebhookSecret/WebhookSecret/g' \
        -e 's/DYNAMODB/DATABASE/g' \
        -e 's/dynamodb/postgres/g' \
        -e 's/DynamoDB/PostgreSQL/g' \
        "$src" > "$dest"

    echo "Copied: $src -> $dest"
}

# Copy remaining webhook implementations
echo "Copying webhook implementations..."

# Transaction Refund Requested
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-refund-requested/use-case.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-refund-requested/use-case.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-refund-requested/use-case-response.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-refund-requested/use-case-response.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-refund-requested/route.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-refund-requested/route.ts"

# Transaction Cancelation Requested
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-cancelation-requested/use-case.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-cancelation-requested/use-case.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-cancelation-requested/use-case-response.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-cancelation-requested/use-case-response.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-cancelation-requested/route.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-cancelation-requested/route.ts"

# Transaction Initialize Session
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/webhook-definition.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/webhook-definition.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/use-case.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/use-case.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/use-case-response.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/use-case-response.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/route.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-initialize-session/route.ts"

# Transaction Process Session
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-process-session/webhook-definition.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-process-session/webhook-definition.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-process-session/use-case.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-process-session/use-case.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-process-session/use-case-response.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-process-session/use-case-response.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/transaction-process-session/route.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/transaction-process-session/route.ts"

# Payment Gateway Initialize Session
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/webhook-definition.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/webhook-definition.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case-response.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case-response.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/route.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/payment-gateway-initialize-session/route.ts"

# Webhook utilities
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/with-recipient-verification.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/with-recipient-verification.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/webhooks/saleor/saleor-webhook-response-schema.ts" \
    "$PAYPAL_DIR/src/app/api/webhooks/saleor/saleor-webhook-response-schema.ts"

# App Manifest and Registration
echo "Copying app manifest and registration..."
copy_and_replace "$STRIPE_DIR/src/app/api/manifest/route.ts" \
    "$PAYPAL_DIR/src/app/api/manifest/route.ts"
copy_and_replace "$STRIPE_DIR/src/app/api/register/route.ts" \
    "$PAYPAL_DIR/src/app/api/register/route.ts"

# tRPC Infrastructure
echo "Copying tRPC infrastructure..."
copy_and_replace "$STRIPE_DIR/src/modules/trpc/trpc-server.ts" \
    "$PAYPAL_DIR/src/modules/trpc/trpc-server.ts"
copy_and_replace "$STRIPE_DIR/src/modules/trpc/trpc-client.ts" \
    "$PAYPAL_DIR/src/modules/trpc/trpc-client.ts"
copy_and_replace "$STRIPE_DIR/src/modules/trpc/trpc-router.ts" \
    "$PAYPAL_DIR/src/modules/trpc/trpc-router.ts"
copy_and_replace "$STRIPE_DIR/src/modules/trpc/context-app-router.ts" \
    "$PAYPAL_DIR/src/modules/trpc/context-app-router.ts"
copy_and_replace "$STRIPE_DIR/src/modules/trpc/protected-client-procedure.ts" \
    "$PAYPAL_DIR/src/modules/trpc/protected-client-procedure.ts"

# tRPC API route
copy_and_replace "$STRIPE_DIR/src/app/api/trpc/[trpc]/route.ts" \
    "$PAYPAL_DIR/src/app/api/trpc/[trpc]/route.ts"

# tRPC Handlers
echo "Copying tRPC handlers..."
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/app-config-router.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/app-config-router.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/new-stripe-config-trpc-handler.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/new-paypal-config-trpc-handler.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/new-stripe-config-input-schema.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/new-paypal-config-input-schema.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/get-stripe-configs-list-trpc-handler.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/get-paypal-configs-list-trpc-handler.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/get-stripe-configs-channels-mapping-trpc-handler.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/get-paypal-configs-channels-mapping-trpc-handler.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/update-mapping-trpc-handler.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/update-mapping-trpc-handler.ts"
copy_and_replace "$STRIPE_DIR/src/modules/app-config/trpc-handlers/remove-stripe-config-trpc-handler.ts" \
    "$PAYPAL_DIR/src/modules/app-config/trpc-handlers/remove-paypal-config-trpc-handler.ts"

# Saleor modules
echo "Copying additional Saleor modules..."
copy_and_replace "$STRIPE_DIR/src/modules/saleor/channel-fetcher.ts" \
    "$PAYPAL_DIR/src/modules/saleor/channel-fetcher.ts"
copy_and_replace "$STRIPE_DIR/src/modules/saleor/saleor-transaction-flow.ts" \
    "$PAYPAL_DIR/src/modules/saleor/saleor-transaction-flow.ts"

# Frontend Pages
echo "Copying frontend pages..."
copy_and_replace "$STRIPE_DIR/src/pages/_app.tsx" \
    "$PAYPAL_DIR/src/pages/_app.tsx"
copy_and_replace "$STRIPE_DIR/src/pages/index.tsx" \
    "$PAYPAL_DIR/src/pages/index.tsx"
copy_and_replace "$STRIPE_DIR/src/pages/config/index.tsx" \
    "$PAYPAL_DIR/src/pages/config/index.tsx"

# UI Components
echo "Copying UI components..."
mkdir -p "$PAYPAL_DIR/src/modules/ui/paypal-configs"
mkdir -p "$PAYPAL_DIR/src/modules/ui/channel-configs"

copy_and_replace "$STRIPE_DIR/src/modules/ui/app-header.tsx" \
    "$PAYPAL_DIR/src/modules/ui/app-header.tsx"
copy_and_replace "$STRIPE_DIR/src/modules/ui/app-breadcrumbs.tsx" \
    "$PAYPAL_DIR/src/modules/ui/app-breadcrumbs.tsx"
copy_and_replace "$STRIPE_DIR/src/modules/ui/use-has-app-access.ts" \
    "$PAYPAL_DIR/src/modules/ui/use-has-app-access.ts"

# Copy stripe-configs to paypal-configs
for file in "$STRIPE_DIR/src/modules/ui/stripe-configs"/*.tsx "$STRIPE_DIR/src/modules/ui/stripe-configs"/*.ts; do
    if [ -f "$file" ]; then
        basename_file=$(basename "$file")
        copy_and_replace "$file" "$PAYPAL_DIR/src/modules/ui/paypal-configs/$basename_file"
    fi
done

# Copy channel-configs
for file in "$STRIPE_DIR/src/modules/ui/channel-configs"/*.tsx "$STRIPE_DIR/src/modules/ui/channel-configs"/*.ts; do
    if [ -f "$file" ]; then
        basename_file=$(basename "$file")
        copy_and_replace "$file" "$PAYPAL_DIR/src/modules/ui/channel-configs/$basename_file"
    fi
done

# Build Configuration Files
echo "Copying build configuration..."
copy_and_replace "$STRIPE_DIR/next.config.ts" \
    "$PAYPAL_DIR/next.config.ts"
copy_and_replace "$STRIPE_DIR/vitest.config.ts" \
    "$PAYPAL_DIR/vitest.config.ts"
copy_and_replace "$STRIPE_DIR/.graphqlrc.ts" \
    "$PAYPAL_DIR/.graphqlrc.ts"
copy_and_replace "$STRIPE_DIR/codegen.ts" \
    "$PAYPAL_DIR/codegen.ts"

# GraphQL
echo "Copying GraphQL files..."
mkdir -p "$PAYPAL_DIR/graphql"
cp -r "$STRIPE_DIR/graphql/"* "$PAYPAL_DIR/graphql/" 2>/dev/null || true

# Public assets
echo "Copying public assets..."
mkdir -p "$PAYPAL_DIR/public"
cp "$STRIPE_DIR/public/logo.png" "$PAYPAL_DIR/public/logo.png" 2>/dev/null || echo "Note: logo.png not found, you'll need to add a PayPal logo"

# Scripts
echo "Copying scripts..."
copy_and_replace "$STRIPE_DIR/scripts/generate-app-webhooks-types.ts" \
    "$PAYPAL_DIR/scripts/generate-app-webhooks-types.ts"
copy_and_replace "$STRIPE_DIR/scripts/run-webhooks-migration.ts" \
    "$PAYPAL_DIR/scripts/run-webhooks-migration.ts"
copy_and_replace "$STRIPE_DIR/scripts/migration-logger.ts" \
    "$PAYPAL_DIR/scripts/migration-logger.ts"
copy_and_replace "$STRIPE_DIR/scripts/deploy.ts" \
    "$PAYPAL_DIR/scripts/deploy.ts"

# Test setup
echo "Copying test setup..."
copy_and_replace "$STRIPE_DIR/src/setup-tests.ts" \
    "$PAYPAL_DIR/src/setup-tests.ts"

# Additional lib files
copy_and_replace "$STRIPE_DIR/src/lib/assert-unreachable.ts" \
    "$PAYPAL_DIR/src/lib/assert-unreachable.ts"
copy_and_replace "$STRIPE_DIR/src/lib/observability-saleor-api-url.ts" \
    "$PAYPAL_DIR/src/lib/observability-saleor-api-url.ts"
copy_and_replace "$STRIPE_DIR/src/lib/observability-source-object-id.ts" \
    "$PAYPAL_DIR/src/lib/observability-source-object-id.ts"
copy_and_replace "$STRIPE_DIR/src/lib/required-client-permissions.ts" \
    "$PAYPAL_DIR/src/lib/required-client-permissions.ts"
copy_and_replace "$STRIPE_DIR/src/lib/tracing.ts" \
    "$PAYPAL_DIR/src/lib/tracing.ts"

echo ""
echo "✅ Copy completed!"
echo ""
echo "⚠️  Manual adjustments needed:"
echo "1. Review all PayPalOrderId vs PayPalPaymentIntentId references"
echo "2. Update API method names (captureOrder vs capturePaymentIntent)"
echo "3. Adjust PayPal-specific business logic in use-cases"
echo "4. Update environment detection (SANDBOX vs TEST)"
echo "5. Review and fix any TypeScript errors"
echo "6. Add PayPal logo to public/logo.png"
echo "7. Generate GraphQL types: pnpm run generate"
echo ""
