import { Box, Text, Button } from "@saleor/macaw-ui";
import { useState, useEffect } from "react";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { trpcClient } from "@/modules/trpc/trpc-client";

export const MerchantConnectionSection = () => {
  const { appBridgeState } = useAppBridge();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate or retrieve tracking ID
  useEffect(() => {
    let storedTrackingId = localStorage.getItem("paypal_merchant_tracking_id");
    if (!storedTrackingId) {
      storedTrackingId = crypto.randomUUID();
      localStorage.setItem("paypal_merchant_tracking_id", storedTrackingId);
    }
    setTrackingId(storedTrackingId);
  }, []);

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
      refetchStatus();
    },
    onError: (err) => {
      setError(`Failed to update merchant ID: ${err.message}`);
    },
  });

  const { mutate: createReferral, isLoading: isCreatingReferral } =
    trpcClient.merchantOnboarding.createMerchantReferral.useMutation({
      onSuccess: (result) => {
        // Redirect to PayPal ISU
        window.location.href = result.actionUrl;
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

  // Check for return from PayPal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturn = urlParams.get("paypal_return");
    const merchantIdInPayPal = urlParams.get("merchantIdInPayPal");

    if (isReturn && merchantIdInPayPal && trackingId) {
      updateMerchantId({
        trackingId,
        paypalMerchantId: merchantIdInPayPal,
      });

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [trackingId]);

  const handleConnectPayPal = () => {
    if (!trackingId) {
      setError("Failed to generate tracking ID");
      return;
    }

    setError(null);

    // Get user email from app bridge or use a default
    const merchantEmail = appBridgeState?.user?.email || "merchant@example.com";

    createReferral({
      trackingId,
      merchantEmail,
      merchantCountry: "US",
      returnUrl: `${window.location.origin}${window.location.pathname}?paypal_return=true`,
      returnUrlDescription: "Return to PayPal configuration",
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

        <Button
          variant="primary"
          onClick={handleConnectPayPal}
          disabled={isLoading}
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
        <Text variant="heading" marginBottom={3}>
          ✓ PayPal Connected
        </Text>
        <Box display="flex" flexDirection="column" gap={2}>
          <Text>
            <strong>Email:</strong> {merchantStatus.merchantEmail}
          </Text>
          <Text>
            <strong>Merchant ID:</strong> {merchantStatus.paypalMerchantId}
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
        <Text variant="heading" marginBottom={2}>
          Payment Methods Status
        </Text>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <PaymentMethodBadge
            label="PayPal Buttons"
            enabled={merchantStatus.paypalButtonsEnabled}
          />
          <PaymentMethodBadge
            label="Card Processing"
            enabled={merchantStatus.acdcEnabled}
          />
          <PaymentMethodBadge
            label="Apple Pay"
            enabled={merchantStatus.applePayEnabled}
          />
          <PaymentMethodBadge
            label="Google Pay"
            enabled={merchantStatus.googlePayEnabled}
          />
        </Box>
      </Box>

      <Box display="flex" gap={2}>
        <Button
          variant="secondary"
          onClick={handleRefreshStatus}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh Status"}
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
