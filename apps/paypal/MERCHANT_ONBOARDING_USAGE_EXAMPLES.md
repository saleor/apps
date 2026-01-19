# PayPal Merchant Onboarding - Usage Examples

This document provides practical examples of how to use the PayPal merchant onboarding API from your frontend application.

## Setup

The merchant onboarding router is available via tRPC at `trpc.merchantOnboarding.*`

## Example 1: Create Onboarding Link for New Merchant

```typescript
import { trpc } from "@/lib/trpc";
import { useState } from "react";

function OnboardMerchantButton() {
  const [loading, setLoading] = useState(false);
  const [actionUrl, setActionUrl] = useState<string | null>(null);

  const createReferralMutation = trpc.merchantOnboarding.createMerchantReferral.useMutation();

  const handleOnboard = async () => {
    setLoading(true);

    try {
      const result = await createReferralMutation.mutateAsync({
        trackingId: "user_12345", // Your internal user/merchant ID
        merchantEmail: "merchant@example.com",
        merchantCountry: "US",
        preferredLanguage: "en-US",
        returnUrl: `${window.location.origin}/paypal/onboarding-complete`,
        returnUrlDescription: "Return to your dashboard",

        // Optional: Prefill business information
        businessName: "My Online Store",
        businessType: "INDIVIDUAL",
        businessWebsite: "https://mystore.com",

        // Enable payment methods (all default to true)
        enablePPCP: true,
        enableApplePay: true,
        enableGooglePay: true,
        enableVaulting: true,
      });

      // Redirect merchant to PayPal signup
      window.location.href = result.actionUrl;
    } catch (error) {
      console.error("Failed to create onboarding link:", error);
      alert("Failed to start onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleOnboard} disabled={loading}>
      {loading ? "Creating onboarding link..." : "Connect with PayPal"}
    </button>
  );
}
```

## Example 2: Display Merchant Onboarding Status

```typescript
import { trpc } from "@/lib/trpc";

function MerchantStatusDashboard({ trackingId }: { trackingId: string }) {
  const { data: status, isLoading, error } = trpc.merchantOnboarding.getMerchantStatus.useQuery({
    trackingId,
  });

  if (isLoading) {
    return <div>Loading merchant status...</div>;
  }

  if (error) {
    return <div>Error loading status: {error.message}</div>;
  }

  if (!status) {
    return <div>Merchant not found</div>;
  }

  return (
    <div className="merchant-status">
      <h2>PayPal Integration Status</h2>

      {/* Overall Status */}
      <div className="status-badge">
        Status: {status.onboardingStatus}
      </div>

      {/* Email Confirmation */}
      {!status.primaryEmailConfirmed && (
        <div className="alert alert-warning">
          ⚠️ Please confirm your email address with PayPal to receive payments.
          Check your inbox for a confirmation email from PayPal.
        </div>
      )}

      {/* Payment Receivability */}
      {!status.paymentsReceivable && (
        <div className="alert alert-error">
          ❌ Your PayPal account has restrictions. Please contact{" "}
          <a href="https://www.paypal.com/selfhelp/contact" target="_blank">
            PayPal Support
          </a>{" "}
          for more information.
        </div>
      )}

      {/* OAuth Integration */}
      {!status.oauthIntegrated && (
        <div className="alert alert-warning">
          ⚠️ Please complete the onboarding process and grant permissions.
          <a href={status.actionUrl}>Complete Onboarding</a>
        </div>
      )}

      {/* Success State */}
      {status.onboardingStatus === "COMPLETED" && (
        <div className="alert alert-success">
          ✅ Your PayPal account is fully configured and ready to accept payments!
        </div>
      )}

      {/* Payment Methods */}
      <div className="payment-methods">
        <h3>Enabled Payment Methods</h3>
        <ul>
          <li>
            {status.paymentMethods.paypalButtons ? "✅" : "❌"} PayPal Buttons
          </li>
          <li>
            {status.paymentMethods.advancedCardProcessing ? "✅" : "❌"} Credit/Debit Cards
          </li>
          <li>
            {status.paymentMethods.applePay ? "✅" : "❌"} Apple Pay
          </li>
          <li>
            {status.paymentMethods.googlePay ? "✅" : "❌"} Google Pay
          </li>
          <li>
            {status.paymentMethods.vaulting ? "✅" : "❌"} Save Payment Methods
          </li>
        </ul>
      </div>

      {/* Last Check */}
      <p className="text-muted">
        Last checked: {status.lastStatusCheck ? new Date(status.lastStatusCheck).toLocaleString() : "Never"}
      </p>
    </div>
  );
}
```

## Example 3: Refresh Merchant Status from PayPal

```typescript
import { trpc } from "@/lib/trpc";
import { useState } from "react";

function RefreshStatusButton({ trackingId }: { trackingId: string }) {
  const utils = trpc.useContext();
  const refreshMutation = trpc.merchantOnboarding.refreshMerchantStatus.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the merchant status
      utils.merchantOnboarding.getMerchantStatus.invalidate({ trackingId });
    },
  });

  const handleRefresh = async () => {
    try {
      const result = await refreshMutation.mutateAsync({ trackingId });

      if (result.onboardingStatus === "COMPLETED") {
        alert("✅ Your account is fully set up and ready!");
      } else {
        alert("Status updated. Please complete any remaining steps.");
      }
    } catch (error: any) {
      if (error.message.includes("not completed onboarding")) {
        alert("Please complete the PayPal onboarding process first.");
      } else {
        alert("Failed to refresh status. Please try again.");
      }
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={refreshMutation.isLoading}
      className="refresh-button"
    >
      {refreshMutation.isLoading ? "Refreshing..." : "🔄 Refresh Status"}
    </button>
  );
}
```

## Example 4: Complete Onboarding Flow (Multi-Step)

```typescript
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"form" | "pending" | "complete">("form");
  const [trackingId, setTrackingId] = useState<string>("");

  const createReferral = trpc.merchantOnboarding.createMerchantReferral.useMutation();
  const { data: status } = trpc.merchantOnboarding.getMerchantStatus.useQuery(
    { trackingId },
    { enabled: !!trackingId && step !== "form" }
  );
  const refreshStatus = trpc.merchantOnboarding.refreshMerchantStatus.useMutation();

  // Handle return from PayPal
  useEffect(() => {
    const merchantIdToken = searchParams.get("merchantIdInPayPal");
    const merchantId = searchParams.get("merchantId");

    if (merchantIdToken || merchantId) {
      // User returned from PayPal
      setStep("pending");

      // Refresh status to get latest info
      if (trackingId) {
        refreshStatus.mutate({ trackingId });
      }
    }
  }, [searchParams]);

  // Step 1: Collect merchant information
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const businessName = formData.get("businessName") as string;
    const country = formData.get("country") as string;

    // Generate tracking ID (use your user ID or generate one)
    const newTrackingId = `merchant_${Date.now()}`;
    setTrackingId(newTrackingId);

    try {
      const result = await createReferral.mutateAsync({
        trackingId: newTrackingId,
        merchantEmail: email,
        merchantCountry: country,
        businessName,
        returnUrl: `${window.location.origin}/onboarding/complete?trackingId=${newTrackingId}`,
      });

      // Redirect to PayPal
      window.location.href = result.actionUrl;
    } catch (error) {
      console.error("Onboarding failed:", error);
    }
  };

  // Step 2: Waiting for onboarding completion
  if (step === "pending") {
    return (
      <div className="onboarding-pending">
        <h2>Setting up your PayPal integration...</h2>

        {status?.oauthIntegrated ? (
          <>
            <p>✅ Connected to PayPal</p>

            {!status.primaryEmailConfirmed && (
              <div className="alert alert-warning">
                Please check your email and confirm your PayPal account.
              </div>
            )}

            {!status.paymentsReceivable && (
              <div className="alert alert-warning">
                There's an issue with your PayPal account. Please contact support.
              </div>
            )}

            {status.onboardingStatus === "COMPLETED" && (
              <button onClick={() => router.push("/dashboard")}>
                Continue to Dashboard
              </button>
            )}
          </>
        ) : (
          <p>Please complete the PayPal onboarding process...</p>
        )}
      </div>
    );
  }

  // Step 1: Form
  return (
    <div className="onboarding-form">
      <h2>Connect your PayPal account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email Address</label>
          <input type="email" name="email" required />
        </div>

        <div>
          <label>Business Name</label>
          <input type="text" name="businessName" required />
        </div>

        <div>
          <label>Country</label>
          <select name="country" required>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            {/* Add more countries */}
          </select>
        </div>

        <button type="submit" disabled={createReferral.isLoading}>
          {createReferral.isLoading ? "Setting up..." : "Connect with PayPal"}
        </button>
      </form>
    </div>
  );
}
```

## Example 5: Admin Dashboard - List All Merchants

```typescript
import { trpc } from "@/lib/trpc";

function AdminMerchantsList() {
  const { data, isLoading } = trpc.merchantOnboarding.listMerchants.useQuery();

  if (isLoading) {
    return <div>Loading merchants...</div>;
  }

  return (
    <div className="merchants-list">
      <h2>PayPal Merchants ({data?.merchants.length})</h2>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Country</th>
            <th>Status</th>
            <th>Payment Methods</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.merchants.map((merchant) => (
            <tr key={merchant.trackingId}>
              <td>{merchant.merchantEmail}</td>
              <td>{merchant.merchantCountry}</td>
              <td>
                <span className={`badge badge-${merchant.onboardingStatus.toLowerCase()}`}>
                  {merchant.onboardingStatus}
                </span>
              </td>
              <td>
                <div className="payment-methods-icons">
                  {merchant.paymentMethods.paypalButtons && <span title="PayPal">💳</span>}
                  {merchant.paymentMethods.advancedCardProcessing && <span title="Cards">💳</span>}
                  {merchant.paymentMethods.applePay && <span title="Apple Pay">🍎</span>}
                  {merchant.paymentMethods.googlePay && <span title="Google Pay">🟢</span>}
                  {merchant.paymentMethods.vaulting && <span title="Vaulting">💾</span>}
                </div>
              </td>
              <td>{new Date(merchant.createdAt).toLocaleDateString()}</td>
              <td>
                <a href={`/admin/merchants/${merchant.trackingId}`}>View Details</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Example 6: Error Handling

```typescript
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";

function OnboardWithErrorHandling() {
  const createReferral = trpc.merchantOnboarding.createMerchantReferral.useMutation();

  const handleOnboard = async () => {
    try {
      const result = await createReferral.mutateAsync({
        trackingId: "user_123",
        merchantEmail: "merchant@example.com",
        returnUrl: "https://myapp.com/return",
      });

      window.location.href = result.actionUrl;
    } catch (error) {
      if (error instanceof TRPCClientError) {
        switch (error.data?.code) {
          case "BAD_REQUEST":
            if (error.message.includes("No PayPal configuration")) {
              alert("Please configure PayPal credentials first in settings.");
            } else if (error.message.includes("Malformed")) {
              alert("Invalid input. Please check your information.");
            } else {
              alert(error.message);
            }
            break;

          case "INTERNAL_SERVER_ERROR":
            if (error.message.includes("partner referral")) {
              alert("Failed to connect to PayPal. Please try again later.");
            } else {
              alert("An unexpected error occurred. Please contact support.");
            }
            break;

          default:
            alert("An error occurred. Please try again.");
        }
      }
    }
  };

  return <button onClick={handleOnboard}>Connect PayPal</button>;
}
```

## Example 7: Unlink PayPal Account

```typescript
// Note: Add this handler to the tRPC router if needed
import { useState } from "react";

function UnlinkPayPalButton({ trackingId }: { trackingId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUnlink = async () => {
    const confirmed = confirm(
      "Are you sure you want to unlink your PayPal account? You will need to reconnect to accept payments."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      // Call your API to delete the onboarding record
      // This doesn't revoke OAuth permissions with PayPal
      // The merchant must do that manually in their PayPal settings
      await fetch("/api/merchants/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId }),
      });

      alert("PayPal account unlinked. PayPal payments are now disabled.");
      window.location.reload();
    } catch (error) {
      alert("Failed to unlink account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleUnlink} disabled={loading} className="btn-danger">
      {loading ? "Unlinking..." : "Unlink PayPal Account"}
    </button>
  );
}
```

## Important URLs

### Sandbox Testing
- Sandbox Dashboard: https://developer.paypal.com/dashboard
- Sandbox Login: https://www.sandbox.paypal.com
- Test Accounts: https://developer.paypal.com/dashboard/accounts

### Production
- PayPal Login: https://www.paypal.com
- Merchant Support: https://www.paypal.com/selfhelp/contact

## Best Practices

1. **Always validate email before creating referral** - Ensures proper onboarding
2. **Store tracking ID in your database** - Link to your user/merchant records
3. **Refresh status after return from PayPal** - Get latest approval status
4. **Show clear error messages** - Help merchants understand what's needed
5. **Periodic status checks** - Keep status up to date (daily or weekly)
6. **Handle incomplete onboardings** - Allow merchants to resume
7. **Test in sandbox thoroughly** - Complete the full flow before going live

## Testing Checklist

- [ ] Create referral with minimum fields
- [ ] Create referral with all optional fields
- [ ] Complete onboarding in sandbox
- [ ] Check status after onboarding
- [ ] Refresh status from PayPal
- [ ] Handle email not confirmed
- [ ] Handle account restrictions
- [ ] Handle OAuth not granted
- [ ] Test each payment method enablement
- [ ] Test error scenarios

---

**Need Help?** Refer to `MERCHANT_ONBOARDING_IMPLEMENTATION.md` for technical details.
