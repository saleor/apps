import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { PayPalClientId, createPayPalClientId } from "../paypal/paypal-client-id";
import { PayPalClientSecret, createPayPalClientSecret } from "../paypal/paypal-client-secret";

/**
 * PayPal Environment
 */
export const PayPalEnvironmentSchema = z.enum(["SANDBOX", "LIVE"]);
export type PayPalEnvironment = z.infer<typeof PayPalEnvironmentSchema>;

/**
 * Global PayPal Configuration
 * Represents WSM's Partner API credentials shared across all tenants
 */
export class GlobalPayPalConfig {
  public readonly id: string;
  public readonly clientId: PayPalClientId;
  public readonly clientSecret: PayPalClientSecret;
  public readonly partnerMerchantId: string | null;
  public readonly partnerFeePercent: number | null;
  public readonly bnCode: string | null;
  public readonly webhookId: string | null;
  public readonly webhookUrl: string | null;
  public readonly environment: PayPalEnvironment;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    clientId: PayPalClientId,
    clientSecret: PayPalClientSecret,
    partnerMerchantId: string | null,
    partnerFeePercent: number | null,
    bnCode: string | null,
    webhookId: string | null,
    webhookUrl: string | null,
    environment: PayPalEnvironment,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.partnerMerchantId = partnerMerchantId;
    this.partnerFeePercent = partnerFeePercent;
    this.bnCode = bnCode;
    this.webhookId = webhookId;
    this.webhookUrl = webhookUrl;
    this.environment = environment;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data: {
    id: string;
    clientId: string;
    clientSecret: string;
    partnerMerchantId?: string | null;
    partnerFeePercent?: number | null;
    bnCode?: string | null;
    webhookId?: string | null;
    webhookUrl?: string | null;
    environment: PayPalEnvironment;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<GlobalPayPalConfig, Error> {
    try {
      const clientId = createPayPalClientId(data.clientId);
      const clientSecret = createPayPalClientSecret(data.clientSecret);

      return ok(
        new GlobalPayPalConfig(
          data.id,
          clientId,
          clientSecret,
          data.partnerMerchantId ?? null,
          data.partnerFeePercent ?? null,
          data.bnCode ?? null,
          data.webhookId ?? null,
          data.webhookUrl ?? null,
          data.environment,
          data.isActive ?? true,
          data.createdAt ?? new Date(),
          data.updatedAt ?? new Date()
        )
      );
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Failed to create GlobalPayPalConfig"));
    }
  }

  /**
   * Convert to plain object for storage
   */
  toJSON(): {
    id: string;
    clientId: string;
    clientSecret: string;
    partnerMerchantId: string | null;
    partnerFeePercent: number | null;
    bnCode: string | null;
    webhookId: string | null;
    webhookUrl: string | null;
    environment: PayPalEnvironment;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      partnerMerchantId: this.partnerMerchantId,
      partnerFeePercent: this.partnerFeePercent,
      bnCode: this.bnCode,
      webhookId: this.webhookId,
      webhookUrl: this.webhookUrl,
      environment: this.environment,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
