#!/bin/bash

# Re-copy webhook routes from Stripe and fix them properly
STRIPE_DIR="/home/alpha/projects/WSM/saleor-apps/apps/stripe"
PAYPAL_DIR="/home/alpha/projects/WSM/saleor-apps/apps/paypal"

echo "Fixing webhook route files..."

for webhook in transaction-cancelation-requested transaction-refund-requested transaction-initialize-session transaction-process-session payment-gateway-initialize-session; do
    echo "Fixing $webhook..."
    
    # Copy clean version from Stripe
    cp "$STRIPE_DIR/src/app/api/webhooks/saleor/$webhook/route.ts" \
       "$PAYPAL_DIR/src/app/api/webhooks/saleor/$webhook/route.ts"
    
    # Apply PayPal-specific replacements
    sed -i 's/stripe/paypal/g' "$PAYPAL_DIR/src/app/api/webhooks/saleor/$webhook/route.ts"
    sed -i 's/Stripe/PayPal/g' "$PAYPAL_DIR/src/app/api/webhooks/saleor/$webhook/route.ts"
    sed -i 's/STRIPE/PAYPAL/g' "$PAYPAL_DIR/src/app/api/webhooks/saleor/$webhook/route.ts"
    sed -i 's/PaymentIntent/Order/g' "$PAYPAL_DIR/src/app/api/webhooks/saleor/$webhook/route.ts"
    sed -i 's/paymentIntent/order/g' "$PAYPAL_DIR/src/app/api/webhooks/saleor/$webhook/route.ts"
done

echo "✓ Webhook routes fixed"
