import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { isInIframe } from "@saleor/apps-shared/is-in-iframe";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/config");
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f4f6",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }} />
          <style>
            {`@keyframes spin { to { transform: rotate(360deg); } }`}
          </style>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading PayPal App...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "48px 24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        textAlign: "center",
        marginBottom: "48px"
      }}>
        <h1 style={{
          fontSize: "36px",
          fontWeight: "bold",
          color: "#1a1a1a",
          marginBottom: "16px"
        }}>
          💳 Saleor PayPal Payment App
        </h1>
        <p style={{
          fontSize: "18px",
          color: "#6b7280",
          lineHeight: "1.6"
        }}>
          Accept online payments from customers using PayPal, credit cards, Apple Pay, Google Pay, and more.
        </p>
      </div>

      <div style={{
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "32px",
        marginBottom: "24px"
      }}>
        <h2 style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#1a1a1a",
          marginBottom: "16px"
        }}>
          Features
        </h2>
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: 0
        }}>
          {[
            "Accept PayPal payments",
            "Process credit and debit cards",
            "Support for Apple Pay and Google Pay",
            "Multi-channel configuration",
            "Test and live mode support",
            "Secure payment processing"
          ].map((feature, index) => (
            <li key={index} style={{
              padding: "8px 0",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ color: "#10b981" }}>✓</span> {feature}
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        backgroundColor: "#eff6ff",
        border: "1px solid #dbeafe",
        borderRadius: "8px",
        padding: "24px",
        textAlign: "center"
      }}>
        <p style={{
          fontSize: "16px",
          color: "#1e40af",
          margin: 0
        }}>
          ℹ️ Return to your Saleor admin dashboard and refresh the page to access the app configuration.
        </p>
      </div>
    </div>
  );
};

export default IndexPage;
