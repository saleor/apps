import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { getPayPalApiUrl, PayPalEnv } from "./paypal-env";
import { createLogger } from "@/lib/logger";
import { paypalOAuthTokenCache } from "./paypal-oauth-token-cache";

const logger = createLogger("PayPalClient");

export class PayPalClient {
  private clientId: PayPalClientId;
  private clientSecret: PayPalClientSecret;
  private partnerMerchantId: string | null;
  private merchantId: PayPalMerchantId | null;
  private merchantEmail: string | null;
  private bnCode: string | null;
  private env: PayPalEnv;
  private baseUrl: string;

  constructor(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }) {
    this.clientId = args.clientId;
    this.clientSecret = args.clientSecret;
    this.partnerMerchantId = args.partnerMerchantId ?? null;
    this.merchantId = args.merchantId ?? null;
    this.merchantEmail = args.merchantEmail ?? null;
    this.bnCode = args.bnCode ?? null;
    this.env = args.env;
    this.baseUrl = getPayPalApiUrl(args.env);
  }

  static create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): PayPalClient {
    return new PayPalClient(args);
  }

  /**
   * Generate PayPal-Auth-Assertion header for partner authentication with merchant context
   * Format: base64({"alg":"none"}).base64({"iss":"partner_client_id","payer_id":"merchant_id"}).
   *
   * NOTE: PayPal requires merchant_id (PayPal Merchant ID) in the payer_id field, not merchant_email.
   * This is crucial for partner fee collection and proper merchant account association.
   */
  private generateAuthAssertion(): string | null {
    // Prefer merchantId over merchantEmail (merchantEmail is deprecated for this purpose)
    const payerId = this.merchantId || this.merchantEmail;

    if (!payerId) {
      return null;
    }

    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64");
    const payload = Buffer.from(
      JSON.stringify({
        iss: this.clientId,
        payer_id: payerId,
      })
    ).toString("base64");

    return `${header}.${payload}.`;
  }

  private async getAccessToken(): Promise<string> {
    // Check global cache first
    const cachedToken = paypalOAuthTokenCache.get(this.clientId, this.env);
    if (cachedToken) {
      return cachedToken;
    }

    // Cache miss - acquire new token
    logger.info("Requesting new PayPal access token", {
      env: this.env,
      client_id: `${this.clientId.substring(0, 8)}...`,
    });

    const tokenAcquisitionStart = Date.now();
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("PayPal authentication failed", {
        env: this.env,
        status: response.status,
        error: errorText,
        acquisition_time_ms: Date.now() - tokenAcquisitionStart,
      });
      throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    const acquisitionTime = Date.now() - tokenAcquisitionStart;

    logger.info("PayPal access token obtained successfully", {
      env: this.env,
      expires_in_seconds: data.expires_in,
      acquisition_time_ms: acquisitionTime,
    });

    // Store in global cache
    paypalOAuthTokenCache.set(this.clientId, this.env, data.access_token, data.expires_in);

    return data.access_token;
  }

  async makeRequest<T>(args: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    body?: unknown;
    includeBnCode?: boolean;
  }): Promise<T> {
    const token = await this.getAccessToken();

    logger.debug("Making PayPal API request", {
      method: args.method,
      path: args.path,
      env: this.env,
      has_body: !!args.body,
      has_merchant_id: !!this.merchantId,
      has_merchant_email: !!this.merchantEmail,
      has_bn_code: !!this.bnCode,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Add PayPal-Auth-Assertion header for partner-managed payments
    const authAssertion = this.generateAuthAssertion();
    if (authAssertion) {
      headers["PayPal-Auth-Assertion"] = authAssertion;
      logger.debug("Added PayPal-Auth-Assertion header for merchant context", {
        merchant_id: this.merchantId,
        client_id: this.clientId ? `${this.clientId.substring(0, 8)}...` : undefined,
      });
    }

    // Log request body for debugging (be careful with sensitive data)
    if (args.body) {
      logger.debug("Request body", {
        body: JSON.stringify(args.body, null, 2),
      });
    }

    // Add PayPal-Partner-Attribution-Id header (BN code) only for Orders API
    // Per PDF Page 4: BN code is required in "create order" requests
    if (this.bnCode && args.includeBnCode) {
      headers["PayPal-Partner-Attribution-Id"] = this.bnCode;
      logger.debug("Added PayPal-Partner-Attribution-Id header", { bnCode: this.bnCode });
    }

    const fullUrl = `${this.baseUrl}${args.path}`;

    // Console log the complete request details in JSON format
    console.log("\n" + "=".repeat(80));
    console.log("PayPal API Request Details:");
    console.log("=".repeat(80));
    console.log(
      JSON.stringify(
        {
          endpoint: {
            method: args.method,
            url: fullUrl,
            path: args.path,
          },
          headers: headers,
          payload: args.body || null,
        },
        null,
        2
      )
    );
    console.log("=".repeat(80) + "\n");

    // Track response time
    const startTime = Date.now();

    const response = await fetch(fullUrl, {
      method: args.method,
      headers,
      body: args.body ? JSON.stringify(args.body) : undefined,
    });

    const responseTime = Date.now() - startTime;

    // Extract debug IDs from response headers (PayPal sends these for support troubleshooting)
    const paypalDebugIdHeader = response.headers.get("paypal-debug-id");
    const correlationIdHeader = response.headers.get("correlation-id");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Extract debug_id from body and headers (they should match)
      const debugId = errorData.debug_id || paypalDebugIdHeader || correlationIdHeader || null;

      logger.error("PayPal API request failed", {
        method: args.method,
        path: args.path,
        status: response.status,
        response_time_ms: responseTime,
        error_name: errorData.name,
        error_message: errorData.message,
        debug_id: debugId, // Critical for PayPal support
        paypal_debug_id_header: paypalDebugIdHeader,
        correlation_id: correlationIdHeader,
        error_details: JSON.stringify(errorData, null, 2),
      });

      // Console log error response with timing and debug_id
      console.log("\n" + "=".repeat(80));
      console.log("PayPal API Response (ERROR):");
      console.log("=".repeat(80));
      console.log(
        JSON.stringify(
          {
            endpoint: {
              method: args.method,
              url: fullUrl,
              path: args.path,
            },
            status: response.status,
            response_time_ms: responseTime,
            debug_id: debugId,
            error: errorData,
          },
          null,
          2
        )
      );
      if (debugId) {
        console.log("PayPal Debug ID (provide to PayPal support):", debugId);
      }
      console.log("=".repeat(80) + "\n");

      throw {
        statusCode: response.status,
        name: errorData.name || "PayPalApiError",
        message: errorData.message || response.statusText,
        debug_id: debugId,
        details: errorData,
      };
    }

    logger.debug("PayPal API request successful", {
      method: args.method,
      path: args.path,
      status: response.status,
      response_time_ms: responseTime,
      paypal_debug_id: paypalDebugIdHeader,
      correlation_id: correlationIdHeader,
    });

    // Console log successful response with timing
    console.log("\n" + "=".repeat(80));
    console.log("PayPal API Response (SUCCESS):");
    console.log("=".repeat(80));
    console.log(
      JSON.stringify(
        {
          endpoint: {
            method: args.method,
            url: fullUrl,
            path: args.path,
          },
          status: response.status,
          response_time_ms: responseTime,
          paypal_debug_id: paypalDebugIdHeader,
          correlation_id: correlationIdHeader,
        },
        null,
        2
      )
    );
    console.log("=".repeat(80) + "\n");

    return response.json() as Promise<T>;
  }

  getEnv(): PayPalEnv {
    return this.env;
  }

  getPartnerMerchantId(): string | null {
    return this.partnerMerchantId;
  }
}
