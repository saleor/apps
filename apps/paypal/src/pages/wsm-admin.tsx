import { Layout } from "@saleor/apps-ui";
import { Box, Text, Button, Input } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppHeader } from "@/modules/ui/app-header";

const WsmAdminPage: NextPage = () => {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [partnerMerchantId, setPartnerMerchantId] = useState("");
  const [bnCode, setBnCode] = useState("");
  const [environment, setEnvironment] = useState<"SANDBOX" | "LIVE">("SANDBOX");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Get secret key from URL parameter
  useEffect(() => {
    const keyFromUrl = router.query.key as string;
    if (keyFromUrl) {
      setSecretKey(keyFromUrl);
    }
  }, [router.query.key]);

  // Query global config
  const {
    data: configData,
    refetch: refetchConfig,
    isLoading: isLoadingConfig,
    error: configError,
  } = trpcClient.wsmAdmin.getGlobalConfig.useQuery(
    { secretKey },
    {
      enabled: !!secretKey,
      retry: false,
      onError: (err: any) => {
        if (err.message?.includes("Invalid super admin")) {
          setMessage({ type: "error", text: "Invalid secret key" });
        } else {
          setMessage({ type: "error", text: `Failed to load config: ${err.message}` });
        }
      },
      onSuccess: (data) => {
        if (data.configured && data.config) {
          setEnvironment(data.config.environment);
        }
      }
    }
  );

  // Mutations
  const { mutate: testCredentials, isLoading: isTestingCredentials } =
    trpcClient.wsmAdmin.testCredentials.useMutation({
      onSuccess: (result) => {
        if (result.success) {
          setMessage({ type: "success", text: result.message });
        } else {
          setMessage({ type: "error", text: result.message });
        }
      },
      onError: (err: any) => {
        setMessage({ type: "error", text: `Test failed: ${err.message}` });
      },
    });

  const { mutate: saveConfig, isLoading: isSavingConfig } =
    trpcClient.wsmAdmin.setGlobalConfig.useMutation({
      onSuccess: (result) => {
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          // Reload config to show updated values
          refetchConfig();
          // Clear form
          setClientId("");
          setClientSecret("");
          setPartnerMerchantId("");
          setBnCode("");
        }
      },
      onError: (err: any) => {
        setMessage({ type: "error", text: `Save failed: ${err.message}` });
      },
    });

  const handleTestCredentials = () => {
    if (!clientId || !clientSecret) {
      setMessage({ type: "error", text: "Please enter Client ID and Client Secret" });
      return;
    }

    setMessage(null);
    testCredentials({
      secretKey,
      clientId,
      clientSecret,
      environment,
    });
  };

  const handleSaveConfig = () => {
    if (!clientId || !clientSecret) {
      setMessage({ type: "error", text: "Please enter Client ID and Client Secret" });
      return;
    }

    setMessage(null);
    saveConfig({
      secretKey,
      clientId,
      clientSecret,
      partnerMerchantId: partnerMerchantId || undefined,
      bnCode: bnCode || undefined,
      environment,
    });
  };

  if (!secretKey) {
    return (
      <Box padding={8}>
        <Text variant="heading">
          WSM Super Admin
        </Text>
        <Text marginTop={4} color="default2">
          Please provide secret key via URL: /wsm-admin?key=YOUR_SECRET_KEY
        </Text>
      </Box>
    );
  }

  if (isLoadingConfig) {
    return (
      <Box padding={8}>
        <Text variant="heading">
          Authenticating...
        </Text>
      </Box>
    );
  }

  if (configError) {
    return (
      <Box padding={8}>
        <Text variant="heading">
          Authentication Failed
        </Text>
        <Text marginTop={4} color="critical1">
          {message?.text || "Invalid secret key or server error"}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <AppHeader />
      <Layout.AppSection
        marginBottom={8}
        heading="WSM Global PayPal Configuration"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>
              Configure global PayPal Partner API credentials that will be used by all Saleor
              tenants for merchant onboarding.
            </Text>
            <Text>
              These credentials should be your PayPal Partner account Client ID and Secret, which
              enable you to onboard merchants and receive partner fees.
            </Text>
          </Box>
        }
      >
        <Box display="flex" flexDirection="column" gap={6}>
          {configData?.configured && configData.config && (
            <Box
              padding={4}
              borderRadius={4}
              borderWidth={1}
              borderColor="default1"
            >
              <Text variant="heading" marginBottom={2}>
                Current Configuration
              </Text>
              <Box display="flex" flexDirection="column" gap={2}>
                <Text>
                  <strong>Environment:</strong> {configData.config.environment}
                </Text>
                <Text>
                  <strong>Client ID:</strong> {configData.config.clientId}
                </Text>
                <Text>
                  <strong>Client Secret:</strong> {configData.config.clientSecret}
                </Text>
                {configData.config.partnerMerchantId && (
                  <Text>
                    <strong>Partner Merchant ID:</strong> {configData.config.partnerMerchantId}
                  </Text>
                )}
                {configData.config.bnCode && (
                  <Text>
                    <strong>BN Code:</strong> {configData.config.bnCode}
                  </Text>
                )}
                <Text color="default2">
                  Last updated: {new Date(configData.config.updatedAt).toLocaleString()}
                </Text>
              </Box>
            </Box>
          )}

          {message && (
            <Box
              padding={4}
              borderRadius={4}
              borderWidth={1}
              borderColor={message.type === "success" ? "success1" : "critical1"}
            >
              <Text color={message.type === "success" ? "success1" : "critical1"}>{message.text}</Text>
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={4}>
            <Text variant="heading">
              {configData?.configured ? "Update" : "Set"} PayPal Partner Credentials
            </Text>

            <Box>
              <Text marginBottom={2}>Environment</Text>
              <Box display="flex" gap={2}>
                <Button
                  variant={environment === "SANDBOX" ? "primary" : "secondary"}
                  onClick={() => setEnvironment("SANDBOX")}
                >
                  Sandbox (Test)
                </Button>
                <Button
                  variant={environment === "LIVE" ? "primary" : "secondary"}
                  onClick={() => setEnvironment("LIVE")}
                >
                  Live (Production)
                </Button>
              </Box>
            </Box>

            <Box>
              <Text marginBottom={2}>Partner Client ID</Text>
              <Input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="AYSq3RDGsmBLJE-otTkBtM..."
              />
            </Box>

            <Box>
              <Text marginBottom={2}>Partner Client Secret</Text>
              <Input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="EHnHq7t06p..."
              />
            </Box>

            <Box>
              <Text marginBottom={2}>Partner Merchant ID (Optional)</Text>
              <Input
                type="text"
                value={partnerMerchantId}
                onChange={(e) => setPartnerMerchantId(e.target.value)}
                placeholder="ABCDEFGHIJKLM"
              />
              <Text marginTop={1} variant="caption" color="default2">
                Your PayPal Partner Merchant ID, required for querying seller status
              </Text>
            </Box>

            <Box>
              <Text marginBottom={2}>BN Code (Optional)</Text>
              <Input
                type="text"
                value={bnCode}
                onChange={(e) => setBnCode(e.target.value)}
                placeholder="YourPartnerName_SP"
              />
              <Text marginTop={1} variant="caption" color="default2">
                PayPal Partner Attribution BN code for tracking partner fees
              </Text>
            </Box>

            <Box display="flex" gap={2}>
              <Button
                variant="secondary"
                onClick={handleTestCredentials}
                disabled={isTestingCredentials || isSavingConfig || !clientId || !clientSecret}
              >
                {isTestingCredentials ? "Testing..." : "Test Credentials"}
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveConfig}
                disabled={isTestingCredentials || isSavingConfig || !clientId || !clientSecret}
              >
                {isSavingConfig ? "Saving..." : "Save Configuration"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Layout.AppSection>
    </Box>
  );
};

export default WsmAdminPage;
