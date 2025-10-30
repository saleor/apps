import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { getPayPalApiUrl, PayPalEnv } from "./paypal-env";
import { createLogger } from "@/lib/logger";

const logger = createLogger("PayPalClient");

export class PayPalClient {
  private clientId: PayPalClientId;
  private clientSecret: PayPalClientSecret;
  private partnerMerchantId: string | null;
  private env: PayPalEnv;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    env: PayPalEnv;
  }) {
    this.clientId = args.clientId;
    this.clientSecret = args.clientSecret;
    this.partnerMerchantId = args.partnerMerchantId ?? null;
    this.env = args.env;
    this.baseUrl = getPayPalApiUrl(args.env);
  }

  static create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    env: PayPalEnv;
  }): PayPalClient {
    return new PayPalClient(args);
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      logger.debug("Using cached access token", {
        env: this.env,
        expires_in_seconds: Math.floor((this.tokenExpiry - Date.now()) / 1000),
      });
      return this.accessToken;
    }

    logger.info("Requesting new PayPal access token", {
      env: this.env,
      client_id: `${this.clientId.substring(0, 8)}...`,
    });

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
      });
      throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.accessToken = data.access_token;
    // Refresh token 1 minute before expiry
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    logger.info("PayPal access token obtained successfully", {
      env: this.env,
      expires_in_seconds: data.expires_in,
    });

    return this.accessToken;
  }

  async makeRequest<T>(args: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    body?: unknown;
  }): Promise<T> {
    const token = await this.getAccessToken();

    logger.debug("Making PayPal API request", {
      method: args.method,
      path: args.path,
      env: this.env,
      has_body: !!args.body,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}${args.path}`, {
      method: args.method,
      headers,
      body: args.body ? JSON.stringify(args.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      logger.error("PayPal API request failed", {
        method: args.method,
        path: args.path,
        status: response.status,
        error_name: errorData.name,
        error_message: errorData.message,
        error_details: JSON.stringify(errorData, null, 2),
      });

      throw {
        statusCode: response.status,
        name: errorData.name || "PayPalApiError",
        message: errorData.message || response.statusText,
        details: errorData,
      };
    }

    logger.debug("PayPal API request successful", {
      method: args.method,
      path: args.path,
      status: response.status,
    });

    return response.json() as Promise<T>;
  }

  getEnv(): PayPalEnv {
    return this.env;
  }

  getPartnerMerchantId(): string | null {
    return this.partnerMerchantId;
  }
}
