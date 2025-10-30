import { Box, Text, Button, Input } from "@saleor/macaw-ui";
import { useState, useEffect } from "react";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { trpcClient } from "@/modules/trpc/trpc-client";

export const MerchantConnectionSection = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [merchantEmail, setMerchantEmail] = useState<string>("");

  // Generate or retrieve tracking ID and set default email
  useEffect(() => {
    let storedTrackingId = localStorage.getItem("paypal_merchant_tracking_id");
    if (!storedTrackingId) {
      storedTrackingId = crypto.randomUUID();
      localStorage.setItem("paypal_merchant_tracking_id", storedTrackingId);
    }
    setTrackingId(storedTrackingId);

    // Set default email from app bridge user
    const defaultEmail = appBridgeState?.user?.email || "";
    setMerchantEmail(defaultEmail);
  }, [appBridgeState?.user?.email]);

  // Query merchant status
  const {
    data: merchantStatus,
    refetch: refetchStatus,
    isLoading: isLoadingStatus,
  } = trpcClient.merchantOnboarding.getMerchantStatus.useQuery(
    { trackingId: trackingId || "" },
    { enabled: !!trackingId, retry: false }
  );

  // Mutations
  const { mutate: updateMerchantId } = trpcClient.merchantOnboarding.updateMerchantId.useMutation({
    onSuccess: () => {
      console.log("Merchant ID updated successfully");
      refetchStatus();
      // Clear the callback data
      localStorage.removeItem("paypal_callback_data");
    },
    onError: (err) => {
      console.error("Failed to update merchant ID:", err);
      setError(`Failed to save PayPal connection: ${err.message}`);
      // Keep callback data for retry
    },
  });

  const { mutate: createReferral, isLoading: isCreatingReferral } =
    trpcClient.merchantOnboarding.createMerchantReferral.useMutation({
      onSuccess: async (result) => {
        console.log("PayPal referral created:", result.actionUrl);

        if (!appBridge) {
          setError("AppBridge not available. Please refresh the page and try again.");
          console.error("AppBridge not available");
          return;
        }

        try {
          // Use AppBridge to open URL in new context (new tab)
          // This works even in sandboxed iframes because it communicates with parent window
          console.log("Dispatching redirect via AppBridge...");

          await appBridge.dispatch({
            type: "redirect",
            payload: {
              to: result.actionUrl,
              newContext: true,
            },
          });

          console.log("AppBridge redirect dispatched successfully");
        } catch (error) {
          console.error("AppBridge redirect failed:", error);
          setError(
            "Failed to open PayPal. Please contact support. Error: " +
            (error instanceof Error ? error.message : String(error))
          );
        }
      },
      onError: (err) => {
        setError(`Failed to initiate connection: ${err.message}`);
      },
    });

  const { mutate: refreshStatus, isLoading: isRefreshing } =
    trpcClient.merchantOnboarding.refreshMerchantStatus.useMutation({
      onSuccess: () => {
        refetchStatus();
      },
      onError: (err) => {
        setError(`Failed to refresh status: ${err.message}`);
      },
    });

  // Store Saleor context for callback page to use
  useEffect(() => {
    if (appBridgeState?.saleorApiUrl) {
      sessionStorage.setItem("saleorApiUrl", appBridgeState.saleorApiUrl);
    }
    if (appBridgeState?.id) {
      sessionStorage.setItem("appId", appBridgeState.id);
    }
  }, [appBridgeState]);

  // Check for callback data from PayPal return
  useEffect(() => {
    const callbackDataStr = localStorage.getItem("paypal_callback_data");

    if (callbackDataStr && trackingId) {
      try {
        const callbackData = JSON.parse(callbackDataStr);
        const { merchantIdInPayPal, timestamp } = callbackData;

        console.log("Found PayPal callback data:", callbackData);

        // Check if data is not too old (within last 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (timestamp && timestamp < fiveMinutesAgo) {
          console.warn("Callback data is too old, ignoring");
          localStorage.removeItem("paypal_callback_data");
          return;
        }

        if (merchantIdInPayPal) {
          console.log("Processing PayPal callback, updating merchant ID");
          updateMerchantId({
            trackingId,
            paypalMerchantId: merchantIdInPayPal,
          });
        }
      } catch (error) {
        console.error("Error processing callback data:", error);
        localStorage.removeItem("paypal_callback_data");
      }
    }
  }, [trackingId]);

  const handleConnectPayPal = () => {
    if (!trackingId) {
      setError("Failed to generate tracking ID");
      return;
    }

    if (!appBridge) {
      setError("AppBridge not available. Please refresh the page and try again.");
      return;
    }

    if (!merchantEmail || !merchantEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);

    console.log("Creating PayPal referral with email:", merchantEmail);

    createReferral({
      trackingId,
      merchantEmail: merchantEmail.trim(),
      merchantCountry: "US",
      returnUrl: `${window.location.origin}/paypal-callback`,
      returnUrlDescription: "Return to store",
    });
  };

  const handleRefreshStatus = () => {
    if (!trackingId) return;
    setError(null);
    refreshStatus({ trackingId });
  };

  const handleDisconnect = () => {
    if (!trackingId) return;
    if (!confirm("Are you sure you want to disconnect your PayPal account?")) return;

    setError(null);
    localStorage.removeItem("paypal_merchant_tracking_id");
    setTrackingId(crypto.randomUUID());
    window.location.reload();
  };

  const isLoading = isLoadingStatus || isCreatingReferral || isRefreshing;

  if (!merchantStatus) {
    // Not connected state
    return (
      <Box display="flex" flexDirection="column" gap={4}>
        {error && (
          <Box padding={4} borderRadius={4} borderWidth={1} borderColor="critical1">
            <Text color="critical1">{error}</Text>
          </Box>
        )}

        <Text>
          Connect your PayPal account to start accepting payments through PayPal.
        </Text>

        <Box display="flex" flexDirection="column" gap={2}>
          <Text>
            <strong>PayPal Account Email</strong>
          </Text>
          <Input
            type="email"
            value={merchantEmail}
            onChange={(e) => setMerchantEmail(e.target.value)}
            placeholder="Enter your PayPal account email"
            disabled={isLoading}
          />
          <Text size={2} color="default2">
            This email will be used to connect your PayPal merchant account.
          </Text>
        </Box>

        <Button
          variant="primary"
          onClick={handleConnectPayPal}
          disabled={isLoading || !merchantEmail}
        >
          {isLoading ? "Connecting..." : "Connect PayPal Account"}
        </Button>

        <Text color="default2">
          You'll be redirected to PayPal to complete the connection process.
        </Text>
      </Box>
    );
  }

  // Connected state
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {error && (
        <Box padding={4} borderRadius={4} borderWidth={1} borderColor="critical1">
          <Text color="critical1">{error}</Text>
        </Box>
      )}

      <Box
        padding={4}
        borderRadius={4}
        borderWidth={1}
        borderColor="success1"
      >
        <Text size={5} marginBottom={3}>
          <strong>✓ PayPal Connected</strong>
        </Text>
        <Box display="flex" flexDirection="column" gap={2}>
          <Text>
            <strong>Email:</strong> {merchantStatus.merchantEmail || "Not provided"}
          </Text>
          <Text>
            <strong>Tracking ID:</strong> {merchantStatus.trackingId}
          </Text>
          <Text>
            <strong>Status:</strong>{" "}
            {merchantStatus.paymentsReceivable ? (
              <Text as="span" color="success1">
                Ready to receive payments
              </Text>
            ) : (
              <Text as="span" color="warning1">
                Setup in progress
              </Text>
            )}
          </Text>
        </Box>
      </Box>

      <Box>
        <Text size={5} marginBottom={2}>
          <strong>Payment Methods Status</strong>
        </Text>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <PaymentMethodBadge
            label="PayPal Buttons"
            enabled={merchantStatus.paymentMethods?.paypalButtons || false}
          />
          <PaymentMethodBadge
            label="Card Processing"
            enabled={merchantStatus.paymentMethods?.advancedCardProcessing || false}
          />
          <PaymentMethodBadge
            label="Apple Pay"
            enabled={merchantStatus.paymentMethods?.applePay || false}
          />
          <PaymentMethodBadge
            label="Google Pay"
            enabled={merchantStatus.paymentMethods?.googlePay || false}
          />
        </Box>
      </Box>

      {merchantStatus.onboardingStatus === "PENDING" && (
        <Box padding={4} borderRadius={4} borderWidth={1} borderColor="warning1">
          <Text color="warning1">
            <strong>Complete PayPal Onboarding</strong>
          </Text>
          <Text size={2} marginTop={1}>
            You've started the connection process but haven't completed the PayPal onboarding yet.
            Please complete the setup in the PayPal window, or click "Connect PayPal Account" again to restart.
          </Text>
        </Box>
      )}

      <Box display="flex" gap={2}>
        <Button
          variant="secondary"
          onClick={handleRefreshStatus}
          disabled={isLoading}
          title="Refresh payment method status from PayPal"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Status"}
        </Button>
        <Button variant="tertiary" onClick={handleDisconnect} disabled={isLoading}>
          Disconnect
        </Button>
      </Box>

      {merchantStatus.lastStatusCheck && (
        <Text color="default2">
          Last updated: {new Date(merchantStatus.lastStatusCheck).toLocaleString()}
        </Text>
      )}
    </Box>
  );
};

const PaymentMethodBadge = ({ label, enabled }: { label: string; enabled: boolean }) => {
  return (
    <Box
      padding={2}
      borderRadius={4}
      borderWidth={1}
      borderColor={enabled ? "success1" : "default1"}
    >
      <Text>
        {enabled ? "✓" : "○"} {label}
      </Text>
    </Box>
  );
};
