import { router } from "@/modules/trpc/trpc-server";

import { CreateMerchantReferralTrpcHandler } from "./create-merchant-referral-trpc-handler";
import { DeleteApplePayDomainHandler } from "./delete-apple-pay-domain-handler";
import { DeleteMerchantOnboardingTrpcHandler } from "./delete-merchant-onboarding-trpc-handler";
import { GetApplePayDomainsHandler } from "./get-apple-pay-domains-handler";
import { GetMerchantStatusTrpcHandler } from "./get-merchant-status-trpc-handler";
import { ListMerchantsTrpcHandler } from "./list-merchants-trpc-handler";
import { RefreshMerchantStatusTrpcHandler } from "./refresh-merchant-status-trpc-handler";
import { RegisterApplePayDomainHandler } from "./register-apple-pay-domain-handler";
import { UpdateMerchantIdTrpcHandler } from "./update-merchant-id-trpc-handler";

/**
 * Merchant Onboarding Router
 * Handles all merchant onboarding operations
 */
export const merchantOnboardingRouter = router({
  /**
   * Create a new merchant referral and get the onboarding signup link
   */
  createMerchantReferral: new CreateMerchantReferralTrpcHandler().getTrpcProcedure(),

  /**
   * Get the current onboarding status for a merchant
   */
  getMerchantStatus: new GetMerchantStatusTrpcHandler().getTrpcProcedure(),

  /**
   * Update merchant's PayPal merchant ID after returning from PayPal ISU
   */
  updateMerchantId: new UpdateMerchantIdTrpcHandler().getTrpcProcedure(),

  /**
   * Refresh merchant status from PayPal (check seller status API)
   */
  refreshMerchantStatus: new RefreshMerchantStatusTrpcHandler().getTrpcProcedure(),

  /**
   * List all merchant onboardings for the current Saleor instance
   */
  listMerchants: new ListMerchantsTrpcHandler().getTrpcProcedure(),

  /**
   * Register an Apple Pay domain for the merchant
   */
  registerApplePayDomain: new RegisterApplePayDomainHandler().getTrpcProcedure(),

  /**
   * Get all registered Apple Pay domains for the merchant
   */
  getApplePayDomains: new GetApplePayDomainsHandler().getTrpcProcedure(),

  /**
   * Delete a registered Apple Pay domain for the merchant
   */
  deleteApplePayDomain: new DeleteApplePayDomainHandler().getTrpcProcedure(),

  /**
   * Delete/disconnect a merchant onboarding record
   */
  deleteMerchant: new DeleteMerchantOnboardingTrpcHandler().getTrpcProcedure(),
});
