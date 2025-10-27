import { Pool } from "pg";
import { Result, ok, err } from "neverthrow";
import { BaseError } from "@saleor/apps-errors";
import { PayPalMerchantId } from "../paypal/paypal-merchant-id";
import { PayPalPartnerReferralId } from "../paypal/paypal-partner-referral-id";
import { PaymentMethodReadiness } from "../paypal/partner-referrals/types";

/**
 * Merchant onboarding status
 */
export type OnboardingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

/**
 * Merchant onboarding record
 */
export interface MerchantOnboardingRecord {
  id: string;
  saleorApiUrl: string;
  trackingId: string;
  paypalMerchantId?: PayPalMerchantId;
  partnerReferralId?: PayPalPartnerReferralId;
  merchantEmail?: string;
  merchantCountry?: string;
  onboardingStatus: OnboardingStatus;
  onboardingStartedAt?: Date;
  onboardingCompletedAt?: Date;
  actionUrl?: string;
  returnUrl?: string;
  primaryEmailConfirmed: boolean;
  paymentsReceivable: boolean;
  oauthIntegrated: boolean;
  paypalButtonsEnabled: boolean;
  acdcEnabled: boolean;
  applePayEnabled: boolean;
  googlePayEnabled: boolean;
  vaultingEnabled: boolean;
  subscribedProducts: any[];
  activeCapabilities: any[];
  lastStatusCheck?: Date;
  statusCheckError?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create merchant onboarding request
 */
export interface CreateMerchantOnboardingRequest {
  saleorApiUrl: string;
  trackingId: string;
  merchantEmail?: string;
  merchantCountry?: string;
  partnerReferralId?: PayPalPartnerReferralId;
  actionUrl?: string;
  returnUrl?: string;
}

/**
 * Update merchant onboarding request
 */
export interface UpdateMerchantOnboardingRequest {
  paypalMerchantId?: PayPalMerchantId;
  onboardingStatus?: OnboardingStatus;
  onboardingStartedAt?: Date;
  onboardingCompletedAt?: Date;
  primaryEmailConfirmed?: boolean;
  paymentsReceivable?: boolean;
  oauthIntegrated?: boolean;
  paypalButtonsEnabled?: boolean;
  acdcEnabled?: boolean;
  applePayEnabled?: boolean;
  googlePayEnabled?: boolean;
  vaultingEnabled?: boolean;
  subscribedProducts?: any[];
  activeCapabilities?: any[];
  lastStatusCheck?: Date;
  statusCheckError?: string;
}

/**
 * Merchant Onboarding Repository Errors
 */
export class MerchantOnboardingRepositoryError extends BaseError.subclass("MerchantOnboardingRepositoryError") {}

/**
 * Repository for managing merchant onboarding records
 */
export interface IMerchantOnboardingRepository {
  create(
    request: CreateMerchantOnboardingRequest
  ): Promise<Result<MerchantOnboardingRecord, MerchantOnboardingRepositoryError>>;

  getByTrackingId(
    saleorApiUrl: string,
    trackingId: string
  ): Promise<Result<MerchantOnboardingRecord | null, MerchantOnboardingRepositoryError>>;

  getByMerchantId(
    saleorApiUrl: string,
    merchantId: PayPalMerchantId
  ): Promise<Result<MerchantOnboardingRecord | null, MerchantOnboardingRepositoryError>>;

  update(
    saleorApiUrl: string,
    trackingId: string,
    updates: UpdateMerchantOnboardingRequest
  ): Promise<Result<MerchantOnboardingRecord, MerchantOnboardingRepositoryError>>;

  updatePaymentMethodReadiness(
    saleorApiUrl: string,
    trackingId: string,
    readiness: PaymentMethodReadiness
  ): Promise<Result<MerchantOnboardingRecord, MerchantOnboardingRepositoryError>>;

  list(
    saleorApiUrl: string
  ): Promise<Result<MerchantOnboardingRecord[], MerchantOnboardingRepositoryError>>;

  delete(
    saleorApiUrl: string,
    trackingId: string
  ): Promise<Result<void, MerchantOnboardingRepositoryError>>;
}

/**
 * PostgreSQL implementation of Merchant Onboarding Repository
 */
export class PostgresMerchantOnboardingRepository implements IMerchantOnboardingRepository {
  constructor(private pool: Pool) {}

  static create(pool: Pool): PostgresMerchantOnboardingRepository {
    return new PostgresMerchantOnboardingRepository(pool);
  }

  private mapRowToRecord(row: any): MerchantOnboardingRecord {
    return {
      id: row.id,
      saleorApiUrl: row.saleor_api_url,
      trackingId: row.tracking_id,
      paypalMerchantId: row.paypal_merchant_id,
      partnerReferralId: row.partner_referral_id,
      merchantEmail: row.merchant_email,
      merchantCountry: row.merchant_country,
      onboardingStatus: row.onboarding_status as OnboardingStatus,
      onboardingStartedAt: row.onboarding_started_at,
      onboardingCompletedAt: row.onboarding_completed_at,
      actionUrl: row.action_url,
      returnUrl: row.return_url,
      primaryEmailConfirmed: row.primary_email_confirmed,
      paymentsReceivable: row.payments_receivable,
      oauthIntegrated: row.oauth_integrated,
      paypalButtonsEnabled: row.paypal_buttons_enabled,
      acdcEnabled: row.acdc_enabled,
      applePayEnabled: row.apple_pay_enabled,
      googlePayEnabled: row.google_pay_enabled,
      vaultingEnabled: row.vaulting_enabled,
      subscribedProducts: row.subscribed_products || [],
      activeCapabilities: row.active_capabilities || [],
      lastStatusCheck: row.last_status_check,
      statusCheckError: row.status_check_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(
    request: CreateMerchantOnboardingRequest
  ): Promise<Result<MerchantOnboardingRecord, MerchantOnboardingRepositoryError>> {
    try {
      const query = `
        INSERT INTO paypal_merchant_onboarding (
          saleor_api_url, tracking_id, merchant_email, merchant_country,
          partner_referral_id, action_url, return_url, onboarding_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
        RETURNING *
      `;

      const values = [
        request.saleorApiUrl,
        request.trackingId,
        request.merchantEmail || null,
        request.merchantCountry || null,
        request.partnerReferralId || null,
        request.actionUrl || null,
        request.returnUrl || null,
      ];

      const result = await this.pool.query(query, values);
      return ok(this.mapRowToRecord(result.rows[0]));
    } catch (error: any) {
      return err(
        new MerchantOnboardingRepositoryError(`Failed to create merchant onboarding: ${error.message}`, {
          cause: error,
        })
      );
    }
  }

  async getByTrackingId(
    saleorApiUrl: string,
    trackingId: string
  ): Promise<Result<MerchantOnboardingRecord | null, MerchantOnboardingRepositoryError>> {
    try {
      const query = `
        SELECT * FROM paypal_merchant_onboarding
        WHERE saleor_api_url = $1 AND tracking_id = $2
      `;

      const result = await this.pool.query(query, [saleorApiUrl, trackingId]);

      if (result.rows.length === 0) {
        return ok(null);
      }

      return ok(this.mapRowToRecord(result.rows[0]));
    } catch (error: any) {
      return err(
        new MerchantOnboardingRepositoryError(`Failed to get merchant onboarding: ${error.message}`, {
          cause: error,
        })
      );
    }
  }

  async getByMerchantId(
    saleorApiUrl: string,
    merchantId: PayPalMerchantId
  ): Promise<Result<MerchantOnboardingRecord | null, MerchantOnboardingRepositoryError>> {
    try {
      const query = `
        SELECT * FROM paypal_merchant_onboarding
        WHERE saleor_api_url = $1 AND paypal_merchant_id = $2
      `;

      const result = await this.pool.query(query, [saleorApiUrl, merchantId]);

      if (result.rows.length === 0) {
        return ok(null);
      }

      return ok(this.mapRowToRecord(result.rows[0]));
    } catch (error: any) {
      return err(
        new MerchantOnboardingRepositoryError(`Failed to get merchant onboarding: ${error.message}`, {
          cause: error,
        })
      );
    }
  }

  async update(
    saleorApiUrl: string,
    trackingId: string,
    updates: UpdateMerchantOnboardingRequest
  ): Promise<Result<MerchantOnboardingRecord, MerchantOnboardingRepositoryError>> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.paypalMerchantId !== undefined) {
        setClause.push(`paypal_merchant_id = $${paramIndex++}`);
        values.push(updates.paypalMerchantId);
      }

      if (updates.onboardingStatus !== undefined) {
        setClause.push(`onboarding_status = $${paramIndex++}`);
        values.push(updates.onboardingStatus);
      }

      if (updates.onboardingStartedAt !== undefined) {
        setClause.push(`onboarding_started_at = $${paramIndex++}`);
        values.push(updates.onboardingStartedAt);
      }

      if (updates.onboardingCompletedAt !== undefined) {
        setClause.push(`onboarding_completed_at = $${paramIndex++}`);
        values.push(updates.onboardingCompletedAt);
      }

      if (updates.primaryEmailConfirmed !== undefined) {
        setClause.push(`primary_email_confirmed = $${paramIndex++}`);
        values.push(updates.primaryEmailConfirmed);
      }

      if (updates.paymentsReceivable !== undefined) {
        setClause.push(`payments_receivable = $${paramIndex++}`);
        values.push(updates.paymentsReceivable);
      }

      if (updates.oauthIntegrated !== undefined) {
        setClause.push(`oauth_integrated = $${paramIndex++}`);
        values.push(updates.oauthIntegrated);
      }

      if (updates.paypalButtonsEnabled !== undefined) {
        setClause.push(`paypal_buttons_enabled = $${paramIndex++}`);
        values.push(updates.paypalButtonsEnabled);
      }

      if (updates.acdcEnabled !== undefined) {
        setClause.push(`acdc_enabled = $${paramIndex++}`);
        values.push(updates.acdcEnabled);
      }

      if (updates.applePayEnabled !== undefined) {
        setClause.push(`apple_pay_enabled = $${paramIndex++}`);
        values.push(updates.applePayEnabled);
      }

      if (updates.googlePayEnabled !== undefined) {
        setClause.push(`google_pay_enabled = $${paramIndex++}`);
        values.push(updates.googlePayEnabled);
      }

      if (updates.vaultingEnabled !== undefined) {
        setClause.push(`vaulting_enabled = $${paramIndex++}`);
        values.push(updates.vaultingEnabled);
      }

      if (updates.subscribedProducts !== undefined) {
        setClause.push(`subscribed_products = $${paramIndex++}`);
        values.push(JSON.stringify(updates.subscribedProducts));
      }

      if (updates.activeCapabilities !== undefined) {
        setClause.push(`active_capabilities = $${paramIndex++}`);
        values.push(JSON.stringify(updates.activeCapabilities));
      }

      if (updates.lastStatusCheck !== undefined) {
        setClause.push(`last_status_check = $${paramIndex++}`);
        values.push(updates.lastStatusCheck);
      }

      if (updates.statusCheckError !== undefined) {
        setClause.push(`status_check_error = $${paramIndex++}`);
        values.push(updates.statusCheckError);
      }

      if (setClause.length === 0) {
        return err(new MerchantOnboardingRepositoryError("No fields to update"));
      }

      values.push(saleorApiUrl, trackingId);

      const query = `
        UPDATE paypal_merchant_onboarding
        SET ${setClause.join(", ")}
        WHERE saleor_api_url = $${paramIndex++} AND tracking_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return err(new MerchantOnboardingRepositoryError("Merchant onboarding not found"));
      }

      return ok(this.mapRowToRecord(result.rows[0]));
    } catch (error: any) {
      return err(
        new MerchantOnboardingRepositoryError(`Failed to update merchant onboarding: ${error.message}`, {
          cause: error,
        })
      );
    }
  }

  async updatePaymentMethodReadiness(
    saleorApiUrl: string,
    trackingId: string,
    readiness: PaymentMethodReadiness
  ): Promise<Result<MerchantOnboardingRecord, MerchantOnboardingRepositoryError>> {
    return this.update(saleorApiUrl, trackingId, {
      primaryEmailConfirmed: readiness.primaryEmailConfirmed,
      paymentsReceivable: readiness.paymentsReceivable,
      oauthIntegrated: readiness.oauthIntegrated,
      paypalButtonsEnabled: readiness.paypalButtons,
      acdcEnabled: readiness.advancedCardProcessing,
      applePayEnabled: readiness.applePay,
      googlePayEnabled: readiness.googlePay,
      vaultingEnabled: readiness.vaulting,
      lastStatusCheck: new Date(),
    });
  }

  async list(
    saleorApiUrl: string
  ): Promise<Result<MerchantOnboardingRecord[], MerchantOnboardingRepositoryError>> {
    try {
      const query = `
        SELECT * FROM paypal_merchant_onboarding
        WHERE saleor_api_url = $1
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [saleorApiUrl]);
      const records = result.rows.map((row) => this.mapRowToRecord(row));

      return ok(records);
    } catch (error: any) {
      return err(
        new MerchantOnboardingRepositoryError(`Failed to list merchant onboardings: ${error.message}`, {
          cause: error,
        })
      );
    }
  }

  async delete(
    saleorApiUrl: string,
    trackingId: string
  ): Promise<Result<void, MerchantOnboardingRepositoryError>> {
    try {
      const query = `
        DELETE FROM paypal_merchant_onboarding
        WHERE saleor_api_url = $1 AND tracking_id = $2
      `;

      await this.pool.query(query, [saleorApiUrl, trackingId]);
      return ok(undefined);
    } catch (error: any) {
      return err(
        new MerchantOnboardingRepositoryError(`Failed to delete merchant onboarding: ${error.message}`, {
          cause: error,
        })
      );
    }
  }
}
