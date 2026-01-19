import { Box, Text, Button, Input } from "@saleor/macaw-ui";
import { useState } from "react";
import { trpcClient } from "@/modules/trpc/trpc-client";

interface ApplePayDomainsSectionProps {
  trackingId: string;
  applePayEnabled: boolean;
}

export const ApplePayDomainsSection = ({
  trackingId,
  applePayEnabled,
}: ApplePayDomainsSectionProps) => {
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Query domains
  const {
    data: domainsData,
    refetch: refetchDomains,
    isLoading: isLoadingDomains,
  } = trpcClient.merchantOnboarding.getApplePayDomains.useQuery(
    { trackingId },
    {
      enabled: !!trackingId && applePayEnabled,
      retry: false,
    }
  );

  // Mutations
  const { mutate: registerDomain, isLoading: isRegistering } =
    trpcClient.merchantOnboarding.registerApplePayDomain.useMutation({
      onSuccess: (result) => {
        setSuccess(`Domain ${result.domain.domainName} registered successfully!`);
        setError(null);
        setNewDomain("");
        refetchDomains();
      },
      onError: (err) => {
        setError(err.message);
        setSuccess(null);
      },
    });

  const {
    mutate: deleteDomain,
    isLoading: isDeleting,
    variables: deletingDomainVars,
  } = trpcClient.merchantOnboarding.deleteApplePayDomain.useMutation({
    onSuccess: (result) => {
      setSuccess(result.message);
      setError(null);
      refetchDomains();
    },
    onError: (err) => {
      setError(err.message || "Failed to delete domain. Please try again.");
      setSuccess(null);
    },
  });

  const handleRegisterDomain = () => {
    if (!newDomain.trim()) {
      setError("Please enter a domain name");
      return;
    }

    // Basic domain validation
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
    if (!domainRegex.test(newDomain.trim())) {
      setError("Invalid domain name format. Example: example.com or subdomain.example.com");
      return;
    }

    setError(null);
    setSuccess(null);
    registerDomain({
      trackingId,
      domainName: newDomain.trim(),
    });
  };

  const handleDeleteDomain = (domainName: string) => {
    setError(null);
    setSuccess(null);

    deleteDomain({
      trackingId,
      domainName,
    });
  };

  if (!applePayEnabled) {
    return (
      <Box
        padding={5}
        borderRadius={4}
        borderWidth={1}
        borderColor="default1"
        __backgroundColor="#FAFAFA"
      >
        <Text size={4} marginBottom={2} fontWeight="medium">
           Apple Pay Domain Management
        </Text>
        <Text size={3} color="default2">
          Apple Pay is not enabled for your account. To use Apple Pay, ensure your PayPal account
          has Apple Pay capabilities enabled. Contact PayPal support or check your account settings.
        </Text>
      </Box>
    );
  }

  const isLoading = isLoadingDomains || isRegistering || isDeleting;
  const domains = domainsData?.domains || [];

  return (
    <Box
      padding={5}
      borderRadius={4}
      borderWidth={1}
      borderColor="default1"
      __backgroundColor="#FAFAFA"
    >
      <Box display="flex" alignItems="center" gap={2} marginBottom={4}>
        <Text size={4} fontWeight="medium">
           Apple Pay Domain Management
        </Text>
        <Box
          paddingX={2}
          paddingY={1}
          borderRadius={3}
          __backgroundColor="#3B82F6"
        >
          <Text size={1} fontWeight="medium" __color="#FFFFFF">
            ENABLED
          </Text>
        </Box>
      </Box>

      <Text size={3} color="default2" marginBottom={5}>
        Register your storefront domains to enable Apple Pay payments. Each domain must be verified
        by Apple to process Apple Pay transactions.
      </Text>

      {/* Error/Success Messages */}
      {error && (
        <Box
          padding={3}
          borderRadius={4}
          borderWidth={1}
          borderColor="critical1"
          __backgroundColor="#FEF2F2"
          marginBottom={4}
        >
          <Text color="critical1" fontWeight="medium">
            ⚠️ {error}
          </Text>
        </Box>
      )}

      {success && (
        <Box
          padding={3}
          borderRadius={4}
          borderWidth={1}
          borderColor="success1"
          __backgroundColor="#F0FDF4"
          marginBottom={4}
        >
          <Text color="success1" fontWeight="medium">
            ✓ {success}
          </Text>
        </Box>
      )}

      {/* Add New Domain */}
      <Box marginBottom={5}>
        <Text size={3} fontWeight="medium" marginBottom={2}>
          Register New Domain
        </Text>
        <Box display="flex" gap={2} alignItems="flex-end">
          <Box __flex="1">
            <Input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleRegisterDomain();
                }
              }}
            />
          </Box>
          <Button
            variant="primary"
            onClick={handleRegisterDomain}
            disabled={isLoading || !newDomain.trim()}
          >
            {isRegistering ? "Registering..." : "Register Domain"}
          </Button>
        </Box>
        <Text size={2} color="default2" marginTop={1}>
          Enter your storefront domain (e.g., store.example.com or example.com)
        </Text>
      </Box>

      {/* Registered Domains List */}
      <Box>
        <Text size={3} fontWeight="medium" marginBottom={3}>
          Registered Domains {domains.length > 0 && `(${domains.length})`}
        </Text>

        {isLoadingDomains ? (
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderColor="default1"
            __backgroundColor="#FFFFFF"
          >
            <Text color="default2">Loading domains...</Text>
          </Box>
        ) : domains.length === 0 ? (
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderColor="default1"
            __backgroundColor="#FFFFFF"
          >
            <Text color="default2">
              No domains registered yet. Add your first domain above to start accepting Apple Pay
              payments.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {domains.map((domain) => (
              <Box
                key={domain.domainName}
                padding={4}
                borderRadius={4}
                borderWidth={1}
                borderColor="default1"
                __backgroundColor="#FFFFFF"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Text size={3} fontWeight="medium">
                      {domain.domainName}
                    </Text>
                    {domain.status && <DomainStatusBadge status={domain.status} />}
                  </Box>
                  {domain.createdAt && (
                    <Text size={2} color="default2">
                      Registered: {new Date(domain.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </Box>
                <Button
                  variant="tertiary"
                  onClick={() => handleDeleteDomain(domain.domainName)}
                  disabled={isLoading}
                  size="small"
                >
                  {isDeleting && deletingDomainVars?.domainName === domain.domainName
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Apple Pay Documentation */}
      <Box
        marginTop={5}
        padding={3}
        borderRadius={4}
        __backgroundColor="#EFF6FF"
        borderWidth={1}
        borderColor="info1"
      >
        <Text size={2} fontWeight="medium" marginBottom={1}>
          ℹ️ Apple Pay Domain Verification
        </Text>
        <Text size={2} color="default2">
          After registering a domain, Apple will verify ownership. The verification process is
          automatic and typically completes within a few minutes. Ensure your domain is accessible
          and properly configured for Apple Pay to work correctly.
        </Text>
      </Box>
    </Box>
  );
};

const DomainStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status?.toUpperCase()) {
      case "VERIFIED":
        return { bg: "#10B981", text: "#FFFFFF", label: "VERIFIED" };
      case "PENDING":
        return { bg: "#F59E0B", text: "#1F2937", label: "PENDING" };
      case "DENIED":
      case "FAILED":
        return { bg: "#EF4444", text: "#FFFFFF", label: "FAILED" };
      default:
        return { bg: "#E5E7EB", text: "#1F2937", label: status || "UNKNOWN" };
    }
  };

  const colors = getStatusColor();

  return (
    <Box
      paddingX={2}
      paddingY={1}
      borderRadius={3}
      __backgroundColor={colors.bg}
      __boxShadow="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    >
      <Text size={1} fontWeight="medium" __color={colors.text}>
        {colors.label}
      </Text>
    </Box>
  );
};
