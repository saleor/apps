import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Box, Text } from "@saleor/macaw-ui";

/**
 * Public callback page for PayPal merchant onboarding
 * This page receives the redirect from PayPal after merchant completes signup
 * It's publicly accessible (no Saleor auth required) and redirects back to dashboard
 */
const PayPalCallbackPage: NextPage = () => {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState<string>("Processing PayPal response...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get all parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const merchantIdInPayPal = urlParams.get("merchantIdInPayPal");
        const merchantId = urlParams.get("merchantId");
        const isEmailConfirmed = urlParams.get("isEmailConfirmed");
        const accountStatus = urlParams.get("accountStatus");
        const permissionsGranted = urlParams.get("permissionsGranted");
        const consentStatus = urlParams.get("consentStatus");
        const riskStatus = urlParams.get("riskStatus");

        console.log("PayPal callback received:", {
          merchantIdInPayPal,
          merchantId,
          isEmailConfirmed,
          accountStatus,
          permissionsGranted,
          consentStatus,
          riskStatus,
        });

        if (!merchantIdInPayPal) {
          setStatus("error");
          setMessage("Missing merchant ID from PayPal response");
          return;
        }

        // Get tracking ID from URL (PayPal returns it as merchantId parameter)
        // The merchantId in the callback URL is the tracking_id that was sent to PayPal
        const trackingId = merchantId;

        if (!trackingId) {
          setStatus("error");
          setMessage("Tracking ID not found in callback URL. Please restart the connection process.");
          return;
        }

        console.log("Storing merchant ID for app to process:", {
          trackingId,
          merchantIdInPayPal,
        });

        // Store the merchant ID in localStorage for the main app to pick up
        localStorage.setItem("paypal_callback_data", JSON.stringify({
          merchantIdInPayPal,
          merchantId,
          isEmailConfirmed,
          accountStatus,
          permissionsGranted,
          consentStatus,
          riskStatus,
          timestamp: Date.now(),
        }));

        setStatus("success");
        setMessage("PayPal account connected successfully! Redirecting back to configuration...");

        // Redirect back to the app configuration page in Saleor dashboard after 1 second
        setTimeout(() => {
          // Try to get the app URL from sessionStorage or construct it
          const saleorApiUrl = sessionStorage.getItem("saleorApiUrl");
          const appId = sessionStorage.getItem("appId");

          if (saleorApiUrl && appId) {
            // Construct the dashboard URL to the app's config page
            const dashboardUrl = saleorApiUrl.replace("/graphql/", "");
            // Redirect to the extensions page which will load the app
            window.location.href = `${dashboardUrl}/apps/${appId}/app`;
          } else {
            // Fallback: redirect to home and let user navigate back
            window.location.href = "/";
          }
        }, 1000);
      } catch (error) {
        console.error("Error processing PayPal callback:", error);
        setStatus("error");
        setMessage(
          `Error connecting PayPal account: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };

    handleCallback();
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: "100vh" }}
      padding={8}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        style={{ maxWidth: "500px", textAlign: "center" }}
      >
        {status === "processing" && (
          <>
            <Box
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #0070ba",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status === "success" && (
          <Text size={10} style={{ fontSize: "48px" }}>
            ✓
          </Text>
        )}

        {status === "error" && (
          <Text size={10} style={{ fontSize: "48px", color: "#d32f2f" }}>
            ✗
          </Text>
        )}

        <Text size={5}>
          <strong>{message}</strong>
        </Text>

        {status === "error" && (
          <Text color="default2">
            Please close this window and try connecting your PayPal account again from the
            configuration page.
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default PayPalCallbackPage;
