import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import { env } from "@/lib/env";
import { PayPalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { createPayPalOrderId } from "@/modules/paypal/paypal-order-id";
import { IPayPalOrdersApiFactory, PayPalOrderItem } from "@/modules/paypal/types";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { resolveSaleorMoneyFromPayPalOrder } from "@/modules/saleor/resolve-saleor-money-from-paypal-order";
import {
  getChannelIdFromRequestedEventPayload,
  getTransactionFromRequestedEventPayload,
} from "@/modules/saleor/transaction-requested-event-helpers";
import { mapPayPalErrorToApiError } from "@/modules/paypal/paypal-api-error";
import { createPayPalMoney } from "@/modules/paypal/paypal-money";
import {
  ChargeActionRequiredResult,
  AuthorizationActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  ChargeFailureResult,
  AuthorizationFailureResult,
} from "@/modules/transaction-result/failure-result";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";

import {
  TransactionInitializeSessionUseCaseResponses,
  TransactionInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

/**
 * Helper function to extract and map line items from Saleor to PayPal format
 */
function extractPayPalItemsFromSource(
  sourceObject: TransactionInitializeSessionEventFragment["sourceObject"],
  currency: string
): PayPalOrderItem[] {
  const items: PayPalOrderItem[] = [];

  if (sourceObject.__typename === "Checkout" && sourceObject.lines) {
    for (const line of sourceObject.lines) {
      if (!line.variant || !line.unitPrice) continue;

      const productName = line.variant.product?.name || line.variant.name || "Product";
      const variantName = line.variant.name;
      const fullName = variantName ? `${productName} - ${variantName}` : productName;

      // Use NET unit price (without tax) to match the item_total breakdown
      const unitAmount = line.unitPrice.net?.amount ?? line.unitPrice.gross.amount;

      items.push({
        name: fullName.substring(0, 127), // PayPal max 127 chars
        quantity: String(line.quantity),
        unit_amount: createPayPalMoney({
          currencyCode: currency,
          amount: unitAmount,
        }),
        sku: line.variant.sku || undefined,
        image_url: line.variant.product?.thumbnail?.url || undefined,
        category: "PHYSICAL_GOODS",
      });
    }
  } else if (sourceObject.__typename === "Order" && sourceObject.lines) {
    for (const line of sourceObject.lines) {
      if (!line.unitPrice) continue;

      const productName = line.productName || "Product";
      const variantName = line.variantName;
      const fullName = variantName ? `${productName} - ${variantName}` : productName;

      // Use NET unit price (without tax) to match the item_total breakdown
      const unitAmount = line.unitPrice.net?.amount ?? line.unitPrice.gross.amount;

      items.push({
        name: fullName.substring(0, 127), // PayPal max 127 chars
        quantity: String(line.quantity),
        unit_amount: createPayPalMoney({
          currencyCode: currency,
          amount: unitAmount,
        }),
        sku: line.productSku || undefined,
        image_url: line.thumbnail?.url || undefined,
        category: "PHYSICAL_GOODS",
      });
    }
  }

  return items;
}

/**
 * Helper function to extract amount breakdown from Saleor source object
 */
function extractAmountBreakdown(
  sourceObject: TransactionInitializeSessionEventFragment["sourceObject"]
) {
  let subtotal: number | undefined;
  let shipping: number | undefined;
  let taxTotal: number | undefined;

  if (sourceObject.__typename === "Checkout") {
    // Use NET amounts (without tax) for item_total and shipping
    subtotal = sourceObject.subtotalPrice?.net?.amount;
    shipping = sourceObject.shippingPrice?.net?.amount;
    // Calculate total tax (subtotal tax + shipping tax)
    const subtotalTax = sourceObject.subtotalPrice?.tax?.amount || 0;
    const shippingTax = sourceObject.shippingPrice?.tax?.amount || 0;
    taxTotal = subtotalTax + shippingTax;
  } else if (sourceObject.__typename === "Order") {
    // Use NET amounts (without tax) for item_total and shipping
    subtotal = sourceObject.subtotal?.net?.amount;
    shipping = sourceObject.shippingPrice?.net?.amount;
    // Calculate total tax (subtotal tax + shipping tax)
    const subtotalTax = sourceObject.subtotal?.tax?.amount || 0;
    const shippingTax = sourceObject.shippingPrice?.tax?.amount || 0;
    taxTotal = subtotalTax + shippingTax;
  }

  return {
    subtotal,
    shipping,
    taxTotal,
  };
}

/**
 * Helper function to extract buyer email from Saleor source object
 */
function extractBuyerEmail(
  sourceObject: TransactionInitializeSessionEventFragment["sourceObject"]
): string | undefined {
  if (sourceObject.__typename === "Checkout") {
    return sourceObject.email || undefined;
  } else if (sourceObject.__typename === "Order") {
    return sourceObject.userEmail || undefined;
  }
  return undefined;
}

/**
 * Helper function to extract shipping address from Saleor source object
 * Maps Saleor address format to PayPal address format
 */
function extractShippingAddress(
  sourceObject: TransactionInitializeSessionEventFragment["sourceObject"]
):
  | {
      name?: { full_name?: string };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_2?: string;
        admin_area_1?: string;
        postal_code?: string;
        country_code?: string;
      };
      email_address?: string;
      phone_number?: { national_number?: string };
    }
  | undefined {
  const shippingAddress =
    sourceObject.__typename === "Checkout" || sourceObject.__typename === "Order"
      ? sourceObject.shippingAddress
      : null;

  if (!shippingAddress) {
    return undefined;
  }

  const fullName =
    `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim() || undefined;

  const email = extractBuyerEmail(sourceObject);

  return {
    name: fullName ? { full_name: fullName } : undefined,
    address: {
      address_line_1: shippingAddress.streetAddress1 || undefined,
      address_line_2: shippingAddress.streetAddress2 || undefined,
      admin_area_2: shippingAddress.city || undefined, // City
      admin_area_1: shippingAddress.countryArea || undefined, // State/Province
      postal_code: shippingAddress.postalCode || undefined,
      country_code: shippingAddress.country?.code || undefined,
    },
    email_address: email,
    phone_number: shippingAddress.phone ? { national_number: shippingAddress.phone } : undefined,
  };
}

/**
 * Helper function to build payer object for PayPal order
 * This is used to prefill buyer information in PayPal checkout
 */
function buildPayerObject(
  sourceObject: TransactionInitializeSessionEventFragment["sourceObject"]
):
  | {
      email_address?: string;
      phone?: {
        phone_type?: "FAX" | "HOME" | "MOBILE" | "OTHER" | "PAGER";
        phone_number?: { national_number: string };
      };
      name?: { given_name?: string; surname?: string };
    }
  | undefined {
  const email = extractBuyerEmail(sourceObject);
  const billingAddress =
    sourceObject.__typename === "Checkout" || sourceObject.__typename === "Order"
      ? sourceObject.billingAddress
      : null;

  if (!email && !billingAddress) {
    return undefined;
  }

  return {
    email_address: email,
    phone: billingAddress?.phone
      ? {
          phone_type: "MOBILE",
          phone_number: { national_number: billingAddress.phone },
        }
      : undefined,
    name: billingAddress
      ? {
          given_name: billingAddress.firstName || undefined,
          surname: billingAddress.lastName || undefined,
        }
      : undefined,
  };
}

type UseCaseExecuteResult = Result<
  TransactionInitializeSessionUseCaseResponsesType,
  AppIsNotConfiguredResponse | BrokenAppResponse | MalformedRequestResponse
>;

export class TransactionInitializeSessionUseCase {
  private logger = createLogger("TransactionInitializeSessionUseCase");
  private paypalConfigRepo: PayPalConfigRepo;
  private paypalOrdersApiFactory: IPayPalOrdersApiFactory;

  constructor(deps: {
    paypalConfigRepo: PayPalConfigRepo;
    paypalOrdersApiFactory: IPayPalOrdersApiFactory;
  }) {
    this.paypalConfigRepo = deps.paypalConfigRepo;
    this.paypalOrdersApiFactory = deps.paypalOrdersApiFactory;
  }

  async execute(args: {
    authData: import("@saleor/app-sdk/APL").AuthData;
    event: TransactionInitializeSessionEventFragment;
  }): Promise<UseCaseExecuteResult> {
    const { authData, event } = args;
    const useCaseStartTime = Date.now();

    this.logger.info("Processing transaction initialize session event", {
      transactionId: event.transaction.id,
      actionType: event.action.actionType,
      amount: event.action.amount,
      currency: event.action.currency,
    });

    // Get channel ID from the event
    const channelId = event.sourceObject.channel.id;

    // Get PayPal configuration for this channel
    const configLoadStart = Date.now();
    const paypalConfigResult = await this.paypalConfigRepo.getPayPalConfig(authData, channelId);
    const configLoadTime = Date.now() - configLoadStart;

    this.logger.debug("PayPal config load timing", {
      config_load_time_ms: configLoadTime,
    });

    if (paypalConfigResult.isErr()) {
      this.logger.error("Failed to get PayPal configuration", {
        error: paypalConfigResult.error,
      });

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          paypalConfigResult.error,
        ),
      );
    }

    if (!paypalConfigResult.value) {
      this.logger.warn("PayPal configuration not found for channel", {
        channelId,
      });

      return err(
        new AppIsNotConfiguredResponse(
          appContextContainer.getContextValue(),
          new BaseError("PayPal configuration not found for channel"),
        ),
      );
    }

    const config = paypalConfigResult.value;

    this.logger.debug("Loaded PayPal configuration", {
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      environment: config.environment,
      hasMerchantEmail: !!config.merchantEmail,
      hasMerchantClientId: !!config.merchantClientId,
      hasMerchantId: !!config.merchantId,
      merchantEmail: config.merchantEmail,
    });

    // Set app context early so it's available even if errors occur later
    const appContext = {
      paypalEnv: config.environment || config.getPayPalEnvValue(),
    };
    appContextContainer.set(appContext);

    // Fetch BN code and partner fee percentage from global config
    let bnCode: string | undefined;
    let partnerMerchantId: string | undefined;
    let partnerFeePercent: number | undefined;
    const globalConfigLoadStart = Date.now();
    try {
      const pool = getPool();
      const globalConfigRepository = GlobalPayPalConfigRepository.create(pool);
      const globalConfigResult = await globalConfigRepository.getActiveConfig();

      if (globalConfigResult.isOk() && globalConfigResult.value) {
        const globalConfig = globalConfigResult.value;
        bnCode = globalConfig.bnCode || undefined;
        partnerMerchantId = globalConfig.partnerMerchantId || undefined;
        partnerFeePercent = globalConfig.partnerFeePercent || undefined;
        this.logger.debug("Retrieved config from global config", {
          hasBnCode: !!bnCode,
          hasPartnerMerchantId: !!partnerMerchantId,
          partnerFeePercent,
        });
      } else {
        this.logger.warn("No active global config found", {
          error: globalConfigResult.isErr() ? globalConfigResult.error : undefined,
        });
      }
    } catch (error) {
      this.logger.warn("Failed to fetch global config", {
        error,
      });
    }
    const globalConfigLoadTime = Date.now() - globalConfigLoadStart;

    this.logger.debug("Global config load timing", {
      global_config_load_time_ms: globalConfigLoadTime,
    });

    // Create PayPal orders API instance with merchant context
    const paypalOrdersApi = this.paypalOrdersApiFactory.create({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      merchantId: config.merchantId ? (config.merchantId as any) : undefined,
      merchantEmail: config.merchantEmail || undefined,
      bnCode,
      env: config.environment,
    });

    // Validate and convert amount
    if (typeof event.action.amount !== "number" || event.action.amount == null) {
      this.logger.error("Invalid amount in transaction event", {
        amount: event.action.amount,
        transactionId: event.transaction.id,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          new BaseError("Invalid amount in transaction event"),
        ),
      );
    }

    if (event.action.amount < 0) {
      this.logger.error("Amount must be greater than or equal to 0", {
        amount: event.action.amount,
        transactionId: event.transaction.id,
      });

      return err(
        new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          new BaseError("Amount must be greater than or equal to 0"),
        ),
      );
    }

    // Convert Saleor money to PayPal money format
    const paypalMoney = createPayPalMoney({
      currencyCode: event.action.currency,
      amount: event.action.amount,
    });

    // Log the source object to debug line items
    this.logger.debug("Source object for line items extraction", {
      typename: event.sourceObject.__typename,
      sourceObjectId: event.sourceObject.id,
      hasLines: "lines" in event.sourceObject,
      linesCount: "lines" in event.sourceObject ? (event.sourceObject.lines?.length || 0) : "N/A",
      sourceObject: JSON.stringify(event.sourceObject, null, 2),
    });

    // Extract line items from source object (Checkout or Order)
    const paypalItems = extractPayPalItemsFromSource(event.sourceObject, event.action.currency);

    // Extract amount breakdown (subtotal, shipping)
    const breakdown = extractAmountBreakdown(event.sourceObject);

    this.logger.debug("Extracted line items and breakdown for PayPal order", {
      itemCount: paypalItems.length,
      items: paypalItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        sku: item.sku,
        unitAmount: item.unit_amount,
      })),
      breakdown: {
        subtotal: breakdown.subtotal,
        shipping: breakdown.shipping,
        taxTotal: breakdown.taxTotal,
        total: event.action.amount,
      },
    });

    // Calculate platform fee if configured
    let platformFees: Array<{ amount: typeof paypalMoney; payee?: { merchant_id: string } }> | undefined;
    if (partnerFeePercent && partnerFeePercent > 0 && config.merchantId && partnerMerchantId) {
      const feeAmount = event.action.amount * (partnerFeePercent / 100);
      const platformFeeMoney = createPayPalMoney({
        currencyCode: event.action.currency,
        amount: feeAmount,
      });

      // Platform fee payee is optional - if not specified, PayPal uses the partner's merchant ID
      // from the authentication context
      platformFees = [{
        amount: platformFeeMoney,
      }];

      this.logger.debug("Calculated platform fee", {
        partnerFeePercent,
        feeAmount,
        platformFeeMoney,
      });
    }

    // Determine PayPal intent based on action type
    const intent = event.action.actionType === "CHARGE" ? "CAPTURE" : "AUTHORIZE";

    this.logger.debug("Creating PayPal order", {
      intent,
      amount: paypalMoney,
      itemsCount: paypalItems.length,
      hasPlatformFees: !!platformFees,
      payeeMerchantId: config.merchantId,
      transactionId: event.transaction.id,
    });

    // Extract buyer and shipping information for PayPal
    const buyerEmail = extractBuyerEmail(event.sourceObject);
    const payer = buildPayerObject(event.sourceObject);
    const shipping = extractShippingAddress(event.sourceObject);

    // Build experience context for PayPal checkout flow
    // This controls the PayPal checkout experience (branding, return URLs, etc.)
    const experienceContext = {
      brand_name: env.APP_NAME || "Store",
      user_action: "PAY_NOW" as const, // Show "Pay Now" instead of "Continue"
      shipping_preference: shipping ? ("SET_PROVIDED_ADDRESS" as const) : ("GET_FROM_FILE" as const),
    };

    // Build payment source configuration
    // This enables callbacks for shipping address changes and other checkout updates
    const paymentSource = env.APP_API_BASE_URL
      ? {
          paypal: {
            experience_context: {
              ...experienceContext,
              order_update_callback_config: {
                url: `${env.APP_API_BASE_URL}/api/webhooks/paypal/order-update-callback`,
                events: [
                  "SHIPPING_CHANGE",
                  "SHIPPING_OPTIONS_CHANGE",
                  "BILLING_ADDRESS_CHANGE",
                  "PHONE_NUMBER_CHANGE",
                ] as Array<"SHIPPING_CHANGE" | "SHIPPING_OPTIONS_CHANGE" | "BILLING_ADDRESS_CHANGE" | "PHONE_NUMBER_CHANGE">,
              },
            },
          },
        }
      : undefined;

    // Create PayPal order
    const createOrderStart = Date.now();
    const createOrderResult = await paypalOrdersApi.createOrder({
      amount: paypalMoney,
      intent,
      payeeMerchantId: config.merchantId || undefined,
      items: paypalItems.length > 0 ? paypalItems : undefined,
      amountBreakdown: paypalItems.length > 0 ? {
        itemTotal: breakdown.subtotal,
        shipping: breakdown.shipping,
        taxTotal: breakdown.taxTotal,
      } : undefined,
      platformFees,
      metadata: {
        saleor_transaction_id: event.transaction.id,
        saleor_source_id: event.sourceObject.id,
        saleor_source_type: event.sourceObject.__typename,
        saleor_channel_id: channelId,
      },
      // PayPal certification-required parameters
      payer,
      shipping,
      softDescriptor: undefined, // TODO: Add softDescriptor to PayPal config
      experienceContext,
      paymentSource,
    });
    const createOrderTime = Date.now() - createOrderStart;
    const totalUseCaseTime = Date.now() - useCaseStartTime;

    this.logger.info("Transaction initialization timing breakdown", {
      config_load_time_ms: configLoadTime,
      global_config_load_time_ms: globalConfigLoadTime,
      create_order_time_ms: createOrderTime,
      total_use_case_time_ms: totalUseCaseTime,
      other_processing_time_ms: totalUseCaseTime - configLoadTime - globalConfigLoadTime - createOrderTime,
    });

    if (createOrderResult.isErr()) {
      const error = mapPayPalErrorToApiError(createOrderResult.error);
      
      this.logger.error("Failed to create PayPal order", {
        error,
      });

      const failureResult = event.action.actionType === "CHARGE" 
        ? new ChargeFailureResult()
        : new AuthorizationFailureResult();

      return ok(
        new TransactionInitializeSessionUseCaseResponses.Failure({
          transactionResult: failureResult,
          error,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    const paypalOrder = createOrderResult.value;

    // Log the full PayPal order response
    this.logger.info("Successfully created PayPal order - Full Response", {
      paypalOrderId: paypalOrder.id,
      status: paypalOrder.status,
      fullResponse: JSON.stringify(paypalOrder, null, 2),
    });

    // Log purchase units details if available
    if (paypalOrder.purchase_units && paypalOrder.purchase_units.length > 0) {
      this.logger.info("PayPal order purchase units details", {
        purchaseUnits: paypalOrder.purchase_units.map((unit) => ({
          amount: unit.amount,
          itemsCount: unit.items?.length || 0,
          items: unit.items || [],
          hasPlatformFees: !!unit.payment_instruction?.platform_fees,
          platformFees: unit.payment_instruction?.platform_fees || [],
        })),
      });
    }

    // Check if order requires payer action (e.g., approval)
    if (paypalOrder.status === "PAYER_ACTION_REQUIRED" || paypalOrder.status === "CREATED") {
      const actionRequiredResult = event.action.actionType === "CHARGE"
        ? new ChargeActionRequiredResult()
        : new AuthorizationActionRequiredResult();

      return ok(
        new TransactionInitializeSessionUseCaseResponses.ActionRequired({
          transactionResult: actionRequiredResult,
          paypalOrderId: createPayPalOrderId(paypalOrder.id),
          data: {
            client_token: null, // PayPal doesn't use client tokens like Stripe
            paypal_order_id: paypalOrder.id,
            environment: config.environment,
          },
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    // If order is already approved, we can proceed
    const saleorMoneyResult = resolveSaleorMoneyFromPayPalOrder(paypalOrder);

    if (saleorMoneyResult.isErr()) {
      this.logger.error("Failed to resolve Saleor money from PayPal order", {
        error: saleorMoneyResult.error,
      });

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          saleorMoneyResult.error,
        ),
      );
    }

    // Create appropriate success result
    const successResult = event.action.actionType === "CHARGE"
      ? new ChargeActionRequiredResult()
      : new AuthorizationActionRequiredResult();

    return ok(
      new TransactionInitializeSessionUseCaseResponses.Success({
        transactionResult: successResult,
        paypalOrderId: createPayPalOrderId(paypalOrder.id),
        saleorMoney: saleorMoneyResult.value,
        appContext: appContextContainer.getContextValue(),
      }),
    );
  }
}