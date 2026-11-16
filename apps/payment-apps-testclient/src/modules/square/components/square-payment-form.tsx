"use client";

import { CreditCard, Gift, Trash2, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { FormButton } from "@/components/form-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { TotalPriceFragment } from "@/graphql/fragments";
import { readFragment } from "@/graphql/gql";
import { clearIdempotencyKey, getIdempotencyKey } from "@/lib/idempotency-key";
import { createPath } from "@/lib/utils";
import {
  clearAttachedCheckout,
  clearCustomerSession,
  type CustomerSession,
  resolveAttachedCheckoutEmail,
  resolveCustomerSession,
  saveCustomerSession,
} from "@/modules/customer-session/components/storage-helpers";
import { getCheckoutTotalPrice } from "@/modules/square/actions/get-checkout-total-price";
import { initializeTransaction } from "@/modules/square/actions/initialize-transaction";
import { type SquareGatewayConfig } from "@/modules/square/schemas/square-gateway-config";
import { deleteStoredPaymentMethod } from "@/modules/square/stored-payment-methods/actions/delete-stored-payment-method";
import { getStoredPaymentMethods } from "@/modules/square/stored-payment-methods/actions/get-stored-payment-methods";
import { initializeSquareTokenization } from "@/modules/square/stored-payment-methods/actions/initialize-square-tokenization";
import { saveSquarePaymentMethod } from "@/modules/square/stored-payment-methods/actions/save-square-payment-method";
import { type StoredPaymentMethod } from "@/modules/square/stored-payment-methods/schemas";
import { getTransactionInitializeOutcome } from "@/modules/square/transaction-initialize-outcome";

import {
  acquireCashAppPaymentLock,
  hasCashAppPaymentLock,
  releaseCashAppPaymentLock,
} from "../cash-app-payment-lock";
import {
  createSandboxGiftCardTokenResult,
  GIFT_CARD_AUTHORIZATION_DURATION_MS,
  type GiftCardAuthorizationState,
  isGiftCardAuthorizationLive,
  parseGiftCardAuthorizationState,
} from "../gift-card-payment";
import {
  createSquareStoreCardVerificationDetails,
  type SaleorCheckoutContact,
} from "../store-card-verification-details";
import {
  createSquareChargeVerificationDetails,
  createSquarePaymentRequest,
  findInitializedSquareMethod,
  getSquareTokenizeErrorMessage,
  type InitializedSquareMethod,
  type SquarePayments,
  type SquareTokenizedPaymentMethod,
  type SquareTokenResult,
} from "../web-payments-sdk";

const SQUARE_TRANSACTION_DATA_VERSION = "saleor.app.square.v1";

const SDK_URLS = {
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
};

const GIFT_CARD_AUTHORIZATION_TERMINAL_ERROR_CODES = new Set([
  "SQUARE_ORDER_SETTLEMENT_CANCELED",
  "SQUARE_GIFT_CARD_AUTHORIZATION_INVALID",
  "SQUARE_GIFT_CARD_REMAINDER_MISMATCH",
  "SQUARE_GIFT_CARD_CONNECTION_MISMATCH",
]);

type PaymentAction = SquareTokenizedPaymentMethod | `saved-card:${string}` | "save-card";

type SquarePaymentAttempt = {
  sourceId: string;
  idempotencyKey: string;
  verificationToken?: string;
};

type ExecuteTokenizedPayment = (
  method: SquareTokenizedPaymentMethod,
  tokenize: () => Promise<SquareTokenResult>,
) => Promise<void>;

const getTokenizedPaymentIdempotencyKeyScope = ({
  envUrl,
  checkoutId,
  paymentGatewayId,
  method,
}: {
  envUrl: string;
  checkoutId: string;
  paymentGatewayId: string;
  method: SquareTokenizedPaymentMethod;
}) => `${envUrl}:${checkoutId}:${paymentGatewayId}:${method}`;

const getSquarePaymentErrorMessage = (error?: { code?: string; message?: string }) => {
  if (error?.code === "UNSUPPORTED_TRANSACTION_ACTION") {
    return "This checkout channel is configured for authorization. Set the Saleor channel payment default to CHARGE for the Square app.";
  }

  if (error?.code === "UNIQUE") {
    return "The browser reused a stale idempotency key for a different Saleor transaction. The key was cleared; try the payment again.";
  }

  return error?.message ?? "Square rejected the payment. Check the app logs for details.";
};

export const SquarePaymentForm = ({
  envUrl,
  checkoutId,
  paymentGatewayId,
  channelSlug,
  checkoutContact,
  totalPrice,
  squareConfig,
}: {
  envUrl: string;
  checkoutId: string;
  paymentGatewayId: string;
  channelSlug: string;
  checkoutContact: SaleorCheckoutContact;
  squareConfig: SquareGatewayConfig;
  totalPrice: {
    gross: {
      amount: number;
      currency: string;
    };
  };
}) => {
  const router = useRouter();
  const cardContainerId = "square-card-container";
  const giftCardContainerId = "square-gift-card-container";
  const [initializedMethods, setInitializedMethods] = useState<InitializedSquareMethod[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPreflightReady, setIsPreflightReady] = useState(false);
  const [activeAction, setActiveAction] = useState<PaymentAction | null>(null);
  const [submittingAction, setSubmittingAction] = useState<PaymentAction | null>(null);
  const [isLoadingSavedMethods, setIsLoadingSavedMethods] = useState(false);
  const [savedMethods, setSavedMethods] = useState<StoredPaymentMethod[]>([]);
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
  const [attachedEmail, setAttachedEmail] = useState<string | null>(null);
  const [giftCardAuthorization, setGiftCardAuthorization] =
    useState<GiftCardAuthorizationState | null>(null);
  const [sandboxGiftCardSourceId, setSandboxGiftCardSourceId] = useState("");
  const [deletingSavedMethodId, setDeletingSavedMethodId] = useState<string | null>(null);
  const activeActionRef = useRef<PaymentAction | null>(null);
  const attemptsRef = useRef(new Map<string, SquarePaymentAttempt>());
  const paymentsRef = useRef<SquarePayments | null>(null);
  const sdkLifecycleRef = useRef<Promise<void>>(Promise.resolve());
  const cashAppTokenizationStartedRef = useRef(false);
  const executeTokenizedPaymentRef = useRef<ExecuteTokenizedPayment | null>(null);
  const card = findInitializedSquareMethod(initializedMethods, "card")?.instance ?? null;
  const supportsSavedCards = squareConfig.methods.includes("saved-card");
  const hasGiftCardAuthorization = giftCardAuthorization !== null;
  const amountDue = giftCardAuthorization?.remainingAmount ?? totalPrice.gross.amount;
  const giftCardAuthorizationStorageKey = `square-gift-card-authorization:${envUrl}:${checkoutId}:${paymentGatewayId}`;
  const cashAppPaymentScope = getTokenizedPaymentIdempotencyKeyScope({
    envUrl,
    checkoutId,
    paymentGatewayId,
    method: "cash-app-pay",
  });

  const persistCustomerSession = useCallback(
    (nextSession: CustomerSession | null | undefined) => {
      if (!nextSession) {
        return;
      }

      saveCustomerSession(envUrl, nextSession);
      setCustomerSession(nextSession);
    },
    [envUrl],
  );

  const clearExpiredCustomerSession = useCallback(() => {
    clearCustomerSession(envUrl);
    clearAttachedCheckout(envUrl, checkoutId);
    setCustomerSession(null);
    setAttachedEmail(null);
    setSavedMethods([]);
  }, [checkoutId, envUrl]);

  const loadStoredMethods = useCallback(
    async (nextSession: CustomerSession) => {
      setIsLoadingSavedMethods(true);

      const response = await getStoredPaymentMethods({
        envUrl,
        channelSlug,
        paymentGatewayId,
        customerSession: {
          token: nextSession.token,
          refreshToken: nextSession.refreshToken,
        },
      });

      setIsLoadingSavedMethods(false);

      if (!response?.data) {
        toast({
          variant: "destructive",
          title: "Saved cards unavailable",
          description: "Saleor did not return saved payment methods.",
        });

        return;
      }

      persistCustomerSession(response.data.refreshedSession);

      if (response.data.status === "error") {
        if (response.data.error.code === "CUSTOMER_SESSION_EXPIRED") {
          clearExpiredCustomerSession();
        }

        toast({
          variant: "destructive",
          title: "Saved cards unavailable",
          description: response.data.error.message,
        });

        return;
      }

      setSavedMethods(response.data.methods);
    },
    [channelSlug, clearExpiredCustomerSession, envUrl, paymentGatewayId, persistCustomerSession],
  );

  useEffect(() => {
    const nextSession = resolveCustomerSession(envUrl);
    const savedAttachedEmail = resolveAttachedCheckoutEmail(envUrl, checkoutId);
    const nextAttachedEmail = nextSession?.email === savedAttachedEmail ? savedAttachedEmail : null;

    if (savedAttachedEmail && !nextAttachedEmail) {
      clearAttachedCheckout(envUrl, checkoutId);
    }

    setCustomerSession(nextSession);
    setAttachedEmail(nextAttachedEmail);

    if (nextSession && nextAttachedEmail && supportsSavedCards) {
      void loadStoredMethods(nextSession);
    }
  }, [checkoutId, envUrl, loadStoredMethods, supportsSavedCards]);

  useEffect(() => {
    let cancelled = false;

    setIsPreflightReady(false);

    void getCheckoutTotalPrice({ envUrl, checkoutId })
      .then((response) => {
        if (cancelled) {
          return;
        }

        const checkout = response?.data?.checkout;
        const latestTotal = readFragment(TotalPriceFragment, checkout?.totalPrice);

        if (!latestTotal) {
          toast({
            variant: "destructive",
            title: "Checkout refresh failed",
            description: "Reload the payment page before trying again.",
          });

          return;
        }

        if (
          latestTotal.gross.amount !== totalPrice.gross.amount ||
          latestTotal.gross.currency !== totalPrice.gross.currency
        ) {
          toast({
            variant: "destructive",
            title: "Checkout total changed",
            description: "Refreshing the payment page with the current total.",
          });
          router.refresh();

          return;
        }

        const persistedAuthorization = parseGiftCardAuthorizationState(
          window.sessionStorage.getItem(giftCardAuthorizationStorageKey),
        );

        if (
          persistedAuthorization &&
          checkout &&
          isGiftCardAuthorizationLive({
            authorization: persistedAuthorization,
            authorizeStatus: checkout.authorizeStatus,
            chargeStatus: checkout.chargeStatus,
            checkoutTotal: latestTotal.gross,
          })
        ) {
          setGiftCardAuthorization(persistedAuthorization);
        } else {
          window.sessionStorage.removeItem(giftCardAuthorizationStorageKey);
          setGiftCardAuthorization(null);

          if (checkout?.authorizeStatus !== "NONE" || checkout?.chargeStatus !== "NONE") {
            toast({
              variant: "destructive",
              title: "Payment state changed",
              description:
                "The saved gift-card authorization is no longer safe to use. Reload checkout before paying again.",
            });

            return;
          }
        }

        setIsPreflightReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Checkout refresh failed",
            description: "Reload the payment page before trying again.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    checkoutId,
    envUrl,
    giftCardAuthorizationStorageKey,
    router,
    totalPrice.gross.amount,
    totalPrice.gross.currency,
  ]);

  const validateGiftCardAuthorization = useCallback(async () => {
    if (!giftCardAuthorization) {
      return true;
    }

    try {
      const response = await getCheckoutTotalPrice({ envUrl, checkoutId });
      const checkout = response?.data?.checkout;
      const latestTotal = readFragment(TotalPriceFragment, checkout?.totalPrice);

      if (
        checkout &&
        latestTotal &&
        isGiftCardAuthorizationLive({
          authorization: giftCardAuthorization,
          authorizeStatus: checkout.authorizeStatus,
          chargeStatus: checkout.chargeStatus,
          checkoutTotal: latestTotal.gross,
        })
      ) {
        return true;
      }

      window.sessionStorage.removeItem(giftCardAuthorizationStorageKey);
      setGiftCardAuthorization(null);

      const checkoutCanAcceptANewPayment =
        checkout?.authorizeStatus === "NONE" && checkout.chargeStatus === "NONE";

      setIsPreflightReady(checkoutCanAcceptANewPayment);
      toast({
        variant: "destructive",
        title: "Gift card authorization expired",
        description: checkoutCanAcceptANewPayment
          ? "The held balance was released. Review the full checkout amount before paying again."
          : "Saleor no longer confirms the saved authorization. Reload checkout before paying again.",
      });

      return false;
    } catch {
      setIsPreflightReady(false);
      toast({
        variant: "destructive",
        title: "Gift card authorization could not be checked",
        description: "Reload checkout before paying the remainder.",
      });

      return false;
    }
  }, [checkoutId, envUrl, giftCardAuthorization, giftCardAuthorizationStorageKey]);

  const beginPaymentAction = useCallback((action: PaymentAction) => {
    if (activeActionRef.current && activeActionRef.current !== action) {
      return false;
    }

    if (!activeActionRef.current) {
      activeActionRef.current = action;
      setActiveAction(action);
    }
    setSubmittingAction(action);

    return true;
  }, []);

  const endPaymentAction = useCallback(
    (action: PaymentAction, keepLock = false) => {
      if (activeActionRef.current !== action) {
        return;
      }

      setSubmittingAction(null);

      if (!keepLock && action === "cash-app-pay") {
        cashAppTokenizationStartedRef.current = false;
        releaseCashAppPaymentLock(cashAppPaymentScope);
      }

      if (!keepLock && activeActionRef.current === action) {
        activeActionRef.current = null;
        setActiveAction(null);
      }
    },
    [cashAppPaymentScope],
  );

  const beginCashAppPaymentAction = useCallback(() => {
    if (!beginPaymentAction("cash-app-pay")) {
      return false;
    }

    acquireCashAppPaymentLock(cashAppPaymentScope);

    return true;
  }, [beginPaymentAction, cashAppPaymentScope]);

  useEffect(() => {
    if (activeActionRef.current || !hasCashAppPaymentLock(cashAppPaymentScope)) {
      return;
    }

    acquireCashAppPaymentLock(cashAppPaymentScope);
    activeActionRef.current = "cash-app-pay";
    setActiveAction("cash-app-pay");
  }, [cashAppPaymentScope]);

  const handlePaymentResponse = useCallback(
    ({
      response,
    }: {
      response: Awaited<ReturnType<typeof initializeTransaction>>;
    }): "authorization" | "success" | "failure" | "unknown" => {
      if (!response?.data) {
        toast({
          variant: "destructive",
          title: "Payment result unknown",
          description: "Saleor did not return a payment response. Retry the same attempt.",
        });

        return "unknown";
      }

      const saleorErrors = response.data.transactionInitialize.errors;

      if (saleorErrors.length > 0) {
        toast({
          variant: "destructive",
          title: saleorErrors[0]?.code ?? "Payment initialization failed",
          description: getSquarePaymentErrorMessage({
            code: saleorErrors[0]?.code,
            message: saleorErrors[0]?.message ?? undefined,
          }),
        });

        return "failure";
      }

      const squareErrors = response.data.transactionInitialize.data?.square?.errors ?? [];

      if (squareErrors.length > 0) {
        const outcomeUnknown = squareErrors[0]?.code === "SQUARE_TIMEOUT";

        if (
          giftCardAuthorization &&
          squareErrors[0]?.code &&
          GIFT_CARD_AUTHORIZATION_TERMINAL_ERROR_CODES.has(squareErrors[0].code)
        ) {
          window.sessionStorage.removeItem(giftCardAuthorizationStorageKey);
          setGiftCardAuthorization(null);
        }

        toast({
          variant: "destructive",
          title: outcomeUnknown
            ? "Payment result unknown"
            : squareErrors[0]?.code ?? "Square payment failed",
          description: getSquarePaymentErrorMessage(squareErrors[0]),
        });

        return outcomeUnknown ? "unknown" : "failure";
      }

      const transactionEvent = response.data.transactionInitialize.transactionEvent;
      const transactionOutcome = getTransactionInitializeOutcome(transactionEvent);

      if (transactionOutcome === "authorization") {
        const squareData = response.data.transactionInitialize.data?.square;
        const remainingAmount = squareData?.remainingAmount;

        if (!remainingAmount) {
          toast({
            title: "Payment authorized",
            description: "Square is capturing the authorized payment.",
          });
          window.sessionStorage.removeItem(giftCardAuthorizationStorageKey);
          setGiftCardAuthorization(null);
          router.push(
            createPath(
              "/env",
              encodeURIComponent(envUrl),
              "checkout",
              checkoutId,
              "payment-gateway",
              "square",
              encodeURIComponent(paymentGatewayId),
              "summary",
            ),
          );

          return "authorization";
        }

        const nextState: GiftCardAuthorizationState = {
          remainingAmount,
          currency: totalPrice.gross.currency,
          expiresAt: new Date(Date.now() + GIFT_CARD_AUTHORIZATION_DURATION_MS).toISOString(),
          cardLast4: squareData?.cardLast4,
        };

        window.sessionStorage.setItem(giftCardAuthorizationStorageKey, JSON.stringify(nextState));
        setGiftCardAuthorization(nextState);
        toast({
          title: "Gift card authorized",
          description: `${remainingAmount} ${totalPrice.gross.currency} remains to pay.`,
        });

        return "authorization";
      }

      if (transactionOutcome !== "success") {
        toast({
          variant: "destructive",
          title: transactionOutcome === "failure" ? "Payment failed" : "Payment result unknown",
          description:
            transactionEvent?.message ||
            "Saleor did not confirm a successful charge. Retry the same attempt before starting another one.",
        });

        return transactionOutcome;
      }

      toast({
        title: "Square payment charged",
        description: "Redirecting to checkout summary.",
      });
      window.sessionStorage.removeItem(giftCardAuthorizationStorageKey);
      setGiftCardAuthorization(null);

      router.push(
        createPath(
          "/env",
          encodeURIComponent(envUrl),
          "checkout",
          checkoutId,
          "payment-gateway",
          "square",
          encodeURIComponent(paymentGatewayId),
          "summary",
        ),
      );

      return "success";
    },
    [
      checkoutId,
      envUrl,
      paymentGatewayId,
      router,
      giftCardAuthorization,
      giftCardAuthorizationStorageKey,
      totalPrice.gross.currency,
    ],
  );

  const executeTokenizedPayment = useCallback(
    async (method: SquareTokenizedPaymentMethod, tokenize: () => Promise<SquareTokenResult>) => {
      if (!beginPaymentAction(method)) {
        return;
      }

      const idempotencyKeyScope = getTokenizedPaymentIdempotencyKeyScope({
        envUrl,
        checkoutId,
        paymentGatewayId,
        method,
      });
      let keepLock = false;

      try {
        if (giftCardAuthorization && !(await validateGiftCardAuthorization())) {
          return;
        }

        let attempt = attemptsRef.current.get(idempotencyKeyScope);

        if (!attempt) {
          const tokenizeResult = await tokenize();

          if (tokenizeResult.status !== "OK" || !tokenizeResult.token) {
            toast({
              variant: "destructive",
              title: "Payment authorization failed",
              description: getSquareTokenizeErrorMessage(tokenizeResult),
            });

            return;
          }

          let verificationToken: string | undefined;

          if (method === "apple-pay" && paymentsRef.current) {
            const verification = await paymentsRef.current.verifyBuyer(
              tokenizeResult.token,
              createSquareChargeVerificationDetails({
                amount: amountDue,
                currency: totalPrice.gross.currency,
                contact: checkoutContact,
              }),
            );

            if (!verification?.token) {
              throw new Error("Apple Pay buyer verification failed.");
            }

            verificationToken = verification.token;
          }

          attempt = {
            sourceId: tokenizeResult.token,
            idempotencyKey: getIdempotencyKey(idempotencyKeyScope),
            verificationToken,
          };
          attemptsRef.current.set(idempotencyKeyScope, attempt);
        }

        const response = await initializeTransaction({
          envUrl,
          checkoutId,
          paymentGatewayId,
          amount: amountDue,
          idempotencyKey: attempt.idempotencyKey,
          data: {
            version: SQUARE_TRANSACTION_DATA_VERSION,
            method,
            sourceId: attempt.sourceId,
            ...(attempt.verificationToken ? { verificationToken: attempt.verificationToken } : {}),
            ...(giftCardAuthorization && method !== "gift-card" ? { giftCardRemainder: true } : {}),
          },
        });
        const outcome = handlePaymentResponse({ response });

        if (outcome !== "unknown") {
          attemptsRef.current.delete(idempotencyKeyScope);
          clearIdempotencyKey(idempotencyKeyScope);
        } else {
          keepLock = true;
        }
      } catch {
        const outcomeUnknown = attemptsRef.current.has(idempotencyKeyScope);

        keepLock = outcomeUnknown;
        toast({
          variant: "destructive",
          title: outcomeUnknown ? "Payment result unknown" : "Payment authorization failed",
          description: outcomeUnknown
            ? "Retry the same payment attempt before starting another one."
            : "Square could not authorize this payment method.",
        });
      } finally {
        endPaymentAction(method, keepLock);
      }
    },
    [
      beginPaymentAction,
      amountDue,
      checkoutContact,
      checkoutId,
      endPaymentAction,
      envUrl,
      handlePaymentResponse,
      paymentGatewayId,
      totalPrice.gross.currency,
      giftCardAuthorization,
      validateGiftCardAuthorization,
    ],
  );

  useEffect(() => {
    executeTokenizedPaymentRef.current = executeTokenizedPayment;
  }, [executeTokenizedPayment]);

  const handleTokenizedMethod = useCallback(
    (method: Exclude<SquareTokenizedPaymentMethod, "cash-app-pay">) => {
      const initializedMethod = findInitializedSquareMethod(initializedMethods, method);

      if (!initializedMethod) {
        return;
      }

      if (initializedMethod.method === "card") {
        void executeTokenizedPayment("card", () =>
          initializedMethod.instance.tokenize(
            createSquareChargeVerificationDetails({
              amount: amountDue,
              currency: totalPrice.gross.currency,
              contact: checkoutContact,
            }),
          ),
        );
      } else if (initializedMethod.method === "gift-card") {
        void executeTokenizedPayment("gift-card", () => initializedMethod.instance.tokenize());
      } else if (initializedMethod.method === "apple-pay") {
        // Apple requires tokenize() to be called directly from this click handler.
        void executeTokenizedPayment("apple-pay", () => initializedMethod.instance.tokenize());
      } else {
        void executeTokenizedPayment("afterpay-clearpay", () =>
          initializedMethod.instance.tokenize(),
        );
      }
    },
    [
      checkoutContact,
      amountDue,
      executeTokenizedPayment,
      initializedMethods,
      totalPrice.gross.currency,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    const mountedMethods: InitializedSquareMethod[] = [];

    setIsInitializing(true);
    setInitializedMethods([]);

    const buildPaymentRequest = (
      payments: SquarePayments,
      method: "apple-pay" | "cash-app-pay" | "afterpay-clearpay",
    ) => {
      const countryCode = squareConfig.square.countryCode;

      if (!countryCode) {
        throw new Error("Square did not provide a location country for wallet payments.");
      }

      return createSquarePaymentRequest({
        payments,
        method,
        countryCode,
        currencyCode: totalPrice.gross.currency,
        amount: amountDue,
      });
    };

    const initializeSquare = async () => {
      if (cancelled) return;
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        throw new Error("Square Web Payments SDK requires HTTPS or a localhost browser context.");
      }

      const existingScript = document.querySelector<HTMLScriptElement>("script[data-square-sdk]");

      await new Promise<void>((resolve, reject) => {
        if (window.Square) {
          resolve();

          return;
        }

        const script = existingScript ?? document.createElement("script");

        script.dataset.squareSdk = "true";
        script.src = SDK_URLS[squareConfig.square.environment];
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load Square Web Payments SDK."));

        if (!existingScript) {
          document.head.appendChild(script);
        }
      });

      if (cancelled || !window.Square) {
        return;
      }

      const payments = window.Square.payments(
        squareConfig.square.applicationId,
        squareConfig.square.locationId,
      );

      paymentsRef.current = payments;

      const initializers: Array<Promise<InitializedSquareMethod | null>> = [];

      if (squareConfig.methods.includes("card")) {
        initializers.push(
          (async () => {
            const instance = await payments.card();

            await instance.attach(`#${cardContainerId}`);

            return { method: "card", instance } as const;
          })(),
        );
      }

      if (squareConfig.methods.includes("gift-card") && !hasGiftCardAuthorization) {
        initializers.push(
          (async () => {
            const instance = await payments.giftCard();

            await instance.attach(`#${giftCardContainerId}`);

            return { method: "gift-card", instance } as const;
          })(),
        );
      }

      if (squareConfig.methods.includes("apple-pay")) {
        initializers.push(
          payments
            .applePay(buildPaymentRequest(payments, "apple-pay"))
            .then((instance) => ({ method: "apple-pay", instance }) as const)
            .catch(() => null),
        );
      }

      if (squareConfig.methods.includes("cash-app-pay")) {
        initializers.push(
          (async () => {
            try {
              const instance = await payments.cashAppPay(
                buildPaymentRequest(payments, "cash-app-pay"),
                {
                  redirectURL: window.location.href,
                  referenceId: checkoutId,
                },
              );

              instance.addEventListener("customerInteraction", () => {
                if (!cancelled) {
                  cashAppTokenizationStartedRef.current = false;
                  beginCashAppPaymentAction();
                }
              });
              instance.addEventListener("customerDismissed", () => {
                if (!cancelled && !cashAppTokenizationStartedRef.current) {
                  endPaymentAction("cash-app-pay");
                }
              });
              instance.addEventListener("ontokenization", (event) => {
                if (cancelled) {
                  return;
                }

                cashAppTokenizationStartedRef.current = true;
                const tokenResult = event.detail.tokenResult;

                if (event.detail.error || !tokenResult) {
                  toast({
                    variant: "destructive",
                    title: "Cash App Pay authorization failed",
                    description: "Cash App Pay did not return a payment token.",
                  });

                  endPaymentAction("cash-app-pay");

                  return;
                }

                void executeTokenizedPaymentRef.current?.("cash-app-pay", async () => tokenResult);
              });
              await instance.attach("#square-cash-app-pay-container");

              return { method: "cash-app-pay", instance } as const;
            } catch {
              return null;
            }
          })(),
        );
      }

      if (squareConfig.methods.includes("afterpay-clearpay")) {
        initializers.push(
          (async () => {
            try {
              const instance = await payments.afterpayClearpay(
                buildPaymentRequest(payments, "afterpay-clearpay"),
              );

              await instance.attach("#square-afterpay-clearpay-container");

              return { method: "afterpay-clearpay", instance } as const;
            } catch {
              return null;
            }
          })(),
        );
      }

      const initialized = (await Promise.all(initializers)).filter(
        (method): method is InitializedSquareMethod => method !== null,
      );

      if (cancelled) {
        await Promise.all(initialized.map((method) => method.instance.destroy?.()));

        return;
      }

      mountedMethods.push(...initialized);
      setInitializedMethods(initialized);
      setIsInitializing(false);
    };

    /*
     * Square teardown is asynchronous. Finish removing old SDK elements before
     * attaching replacements to the same containers after the amount changes.
     */
    const initialization = sdkLifecycleRef.current.then(initializeSquare).catch((error) => {
      if (cancelled) {
        return;
      }

      setIsInitializing(false);
      toast({
        variant: "destructive",
        title: "Square could not initialize",
        description:
          error instanceof Error ? error.message : "Could not initialize Square payment methods.",
      });
    });

    sdkLifecycleRef.current = initialization;

    return () => {
      cancelled = true;
      paymentsRef.current = null;
      sdkLifecycleRef.current = initialization.then(async () => {
        await Promise.all(mountedMethods.map((method) => method.instance.destroy?.()));
      });
    };
  }, [
    checkoutId,
    beginCashAppPaymentAction,
    endPaymentAction,
    squareConfig.methods,
    squareConfig.square.applicationId,
    squareConfig.square.countryCode,
    squareConfig.square.environment,
    squareConfig.square.locationId,
    amountDue,
    hasGiftCardAuthorization,
    totalPrice.gross.currency,
  ]);

  const handlePayWithSavedMethod = async (method: StoredPaymentMethod) => {
    const savedMethodIdempotencyKeyScope = `${envUrl}:${checkoutId}:${paymentGatewayId}:saved:${method.paymentMethodId}`;
    const action: PaymentAction = `saved-card:${method.id}`;

    if (!beginPaymentAction(action)) {
      return;
    }

    let keepLock = false;

    try {
      if (giftCardAuthorization && !(await validateGiftCardAuthorization())) {
        return;
      }

      const response = await initializeTransaction({
        envUrl,
        checkoutId,
        paymentGatewayId,
        amount: amountDue,
        idempotencyKey: getIdempotencyKey(savedMethodIdempotencyKeyScope),
        data: {
          version: SQUARE_TRANSACTION_DATA_VERSION,
          method: "saved-card",
          paymentMethodId: method.paymentMethodId,
          ...(giftCardAuthorization ? { giftCardRemainder: true } : {}),
        },
      });
      const outcome = handlePaymentResponse({ response });

      keepLock = outcome === "unknown";

      if (!keepLock) {
        clearIdempotencyKey(savedMethodIdempotencyKeyScope);
      }
    } catch {
      keepLock = true;
      toast({
        variant: "destructive",
        title: "Payment result unknown",
        description: "Retry the same saved-card attempt before starting another one.",
      });
    } finally {
      endPaymentAction(action, keepLock);
    }
  };

  const handleSaveCard = async () => {
    if (!card || !customerSession || !attachedEmail) {
      return;
    }

    if (!beginPaymentAction("save-card")) {
      return;
    }

    try {
      let activeCustomerSession = customerSession;

      const initializeResponse = await initializeSquareTokenization({
        envUrl,
        channelSlug,
        paymentGatewayId,
        customerSession: {
          token: activeCustomerSession.token,
          refreshToken: activeCustomerSession.refreshToken,
        },
      });

      if (!initializeResponse?.data) {
        toast({
          variant: "destructive",
          title: "Card save failed",
          description: "Saleor did not return a tokenization response.",
        });

        return;
      }

      if (initializeResponse.data.refreshedSession) {
        activeCustomerSession = initializeResponse.data.refreshedSession;
        persistCustomerSession(activeCustomerSession);
      }

      if (initializeResponse.data.status === "error") {
        if (initializeResponse.data.error.code === "CUSTOMER_SESSION_EXPIRED") {
          clearExpiredCustomerSession();
        }

        toast({
          variant: "destructive",
          title: initializeResponse.data.error.code ?? "Card save failed",
          description: initializeResponse.data.error.message,
        });

        return;
      }

      const tokenizeResult = await card.tokenize(
        createSquareStoreCardVerificationDetails({
          ...checkoutContact,
          email: checkoutContact.email?.trim() || attachedEmail,
        }),
      );

      if (tokenizeResult.status !== "OK" || !tokenizeResult.token) {
        toast({
          variant: "destructive",
          title: "Card tokenization failed",
          description: getSquareTokenizeErrorMessage(tokenizeResult),
        });

        return;
      }

      const saveResponse = await saveSquarePaymentMethod({
        envUrl,
        channelSlug,
        paymentGatewayId,
        customerSession: {
          token: activeCustomerSession.token,
          refreshToken: activeCustomerSession.refreshToken,
        },
        sourceId: tokenizeResult.token,
      });

      if (!saveResponse?.data) {
        toast({
          variant: "destructive",
          title: "Card save failed",
          description: "Saleor did not return a saved-card response.",
        });

        return;
      }

      if (saveResponse.data.refreshedSession) {
        activeCustomerSession = saveResponse.data.refreshedSession;
        persistCustomerSession(activeCustomerSession);
      }

      if (saveResponse.data.status === "error") {
        if (saveResponse.data.error.code === "CUSTOMER_SESSION_EXPIRED") {
          clearExpiredCustomerSession();
        }

        toast({
          variant: "destructive",
          title: saveResponse.data.error.code ?? "Card save failed",
          description: saveResponse.data.error.message,
        });

        return;
      }

      toast({
        title: "Card saved",
        description: "Saved payment methods were refreshed.",
      });

      await loadStoredMethods(activeCustomerSession);
    } finally {
      endPaymentAction("save-card");
    }
  };

  const handleDeleteStoredMethod = async (method: StoredPaymentMethod) => {
    if (!customerSession) {
      return;
    }

    setDeletingSavedMethodId(method.id);

    const response = await deleteStoredPaymentMethod({
      envUrl,
      channelSlug,
      storedPaymentMethodId: method.id,
      customerSession: {
        token: customerSession.token,
        refreshToken: customerSession.refreshToken,
      },
    });

    setDeletingSavedMethodId(null);

    if (!response?.data) {
      toast({
        variant: "destructive",
        title: "Card removal failed",
        description: "Saleor did not return a saved-card removal response.",
      });

      return;
    }

    persistCustomerSession(response.data.refreshedSession);

    if (response.data.status === "error") {
      if (response.data.error.code === "CUSTOMER_SESSION_EXPIRED") {
        clearExpiredCustomerSession();
      }

      toast({
        variant: "destructive",
        title: response.data.error.code ?? "Card removal failed",
        description: response.data.error.message,
      });

      return;
    }

    setSavedMethods((methods) => methods.filter((savedMethod) => savedMethod.id !== method.id));
    toast({
      title: "Saved card removed",
    });
  };

  const canUseSavedMethods = Boolean(customerSession && attachedEmail && supportsSavedCards);
  const applePayAvailable = Boolean(findInitializedSquareMethod(initializedMethods, "apple-pay"));
  const afterpayClearpayAvailable = Boolean(
    findInitializedSquareMethod(initializedMethods, "afterpay-clearpay"),
  );
  const actionUnavailable = (action: PaymentAction) =>
    !isPreflightReady ||
    submittingAction !== null ||
    (activeAction !== null && activeAction !== action);

  return (
    <section className="mx-auto grid w-full max-w-xl gap-8 py-8">
      <div className="grid gap-2">
        <h2 className="text-2xl font-bold">Square Payment</h2>
        <p className="text-sm text-muted-foreground">
          Total: {totalPrice.gross.amount} {totalPrice.gross.currency}
        </p>
      </div>

      {giftCardAuthorization ? (
        <div className="grid gap-1 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Square gift card authorized</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {giftCardAuthorization.cardLast4
              ? `Gift card ending ${giftCardAuthorization.cardLast4}. `
              : ""}
            Remaining: {giftCardAuthorization.remainingAmount} {totalPrice.gross.currency}
          </p>
          <p className="text-xs text-muted-foreground">
            The gift card is not charged until the remaining payment succeeds. Square releases the
            authorization after 30 minutes if checkout is not completed.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4">
        {supportsSavedCards ? (
          <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                <WalletCards className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="grid gap-1">
                <h3 className="text-sm font-medium">Saved cards</h3>
                <p className="text-sm text-muted-foreground">
                  {canUseSavedMethods
                    ? `Using saved cards for ${attachedEmail}.`
                    : "Log in as a customer during checkout setup to use saved cards."}
                </p>
              </div>
            </div>

            {canUseSavedMethods ? (
              <div className="grid gap-2 border-t pt-4">
                {isLoadingSavedMethods ? (
                  <p className="text-sm text-muted-foreground">Loading saved cards...</p>
                ) : savedMethods.length > 0 ? (
                  savedMethods.map((method) => (
                    <div
                      key={method.id}
                      className="grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {method.name ?? method.creditCardInfo?.brand ?? method.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.creditCardInfo
                            ? `${method.creditCardInfo.brand} ending ${method.creditCardInfo.lastDigits}`
                            : method.paymentMethodId}
                        </p>
                      </div>
                      <FormButton
                        type="button"
                        size="sm"
                        onClick={() => handlePayWithSavedMethod(method)}
                        loading={submittingAction === `saved-card:${method.id}`}
                        disabled={actionUnavailable(`saved-card:${method.id}`)}
                      >
                        {giftCardAuthorization
                          ? `Pay ${amountDue} ${totalPrice.gross.currency}`
                          : "Pay"}
                      </FormButton>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="Remove saved card"
                        onClick={() => handleDeleteStoredMethod(method)}
                        disabled={deletingSavedMethodId === method.id || activeAction !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No saved cards for this customer.</p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {squareConfig.methods.includes("gift-card") ? (
          <div
            className={
              giftCardAuthorization
                ? "hidden"
                : "grid gap-4 rounded-xl border bg-card p-5 shadow-sm"
            }
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                <Gift className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">Gift card</h3>
            </div>
            <div className="grid gap-4 border-t pt-4">
              <div id={giftCardContainerId} className="min-h-16" />
              <FormButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => handleTokenizedMethod("gift-card")}
                disabled={isInitializing || actionUnavailable("gift-card")}
                loading={submittingAction === "gift-card"}
              >
                Apply gift card
              </FormButton>
              {squareConfig.square.environment === "sandbox" ? (
                <div className="grid gap-3 rounded-lg border border-dashed p-3">
                  <div className="grid gap-1">
                    <Label htmlFor="sandbox-gift-card-source-id">Partial-payment test</Label>
                    <p className="text-xs text-muted-foreground">
                      Paste the ID of a low-balance gift card created in Square Sandbox. This
                      bypasses SDK tokenization only for this test.
                    </p>
                  </div>
                  <Input
                    id="sandbox-gift-card-source-id"
                    value={sandboxGiftCardSourceId}
                    onChange={(event) => setSandboxGiftCardSourceId(event.target.value)}
                    placeholder="Square Sandbox gift card ID"
                    autoComplete="off"
                    disabled={actionUnavailable("gift-card")}
                  />
                  <FormButton
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      executeTokenizedPayment("gift-card", async () =>
                        createSandboxGiftCardTokenResult(sandboxGiftCardSourceId),
                      )
                    }
                    disabled={actionUnavailable("gift-card")}
                    loading={submittingAction === "gift-card"}
                  >
                    Apply Sandbox test card
                  </FormButton>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">Credit or debit card</h3>
          </div>
          <div className="grid gap-4 border-t pt-4">
            <div id={cardContainerId} className="min-h-24" />
            <div className="flex flex-wrap items-center justify-end gap-3">
              <FormButton
                type="button"
                onClick={handleSaveCard}
                variant="secondary"
                disabled={
                  !card ||
                  isInitializing ||
                  actionUnavailable("save-card") ||
                  !canUseSavedMethods ||
                  submittingAction === "save-card"
                }
                loading={submittingAction === "save-card"}
              >
                Save card
              </FormButton>
              <FormButton
                type="button"
                onClick={() => handleTokenizedMethod("card")}
                disabled={!card || isInitializing || actionUnavailable("card")}
                loading={submittingAction === "card" || isInitializing}
                data-testid="button-pay"
              >
                {giftCardAuthorization
                  ? `Pay remaining ${amountDue} ${totalPrice.gross.currency}`
                  : "Pay once"}
              </FormButton>
            </div>
          </div>
        </div>

        {!giftCardAuthorization && applePayAvailable ? (
          <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-medium">Apple Pay</h3>
            <button
              type="button"
              aria-label="Pay with Apple Pay"
              className="h-12 w-full rounded-lg bg-black text-sm font-medium text-white disabled:opacity-50"
              disabled={actionUnavailable("apple-pay")}
              onClick={() => handleTokenizedMethod("apple-pay")}
            >
              Pay with Apple Pay
            </button>
          </div>
        ) : null}

        {!giftCardAuthorization && squareConfig.methods.includes("cash-app-pay") ? (
          <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-medium">Cash App Pay</h3>
            <div
              id="square-cash-app-pay-container"
              className={
                actionUnavailable("cash-app-pay") ? "pointer-events-none opacity-50" : undefined
              }
            />
          </div>
        ) : null}

        {!giftCardAuthorization && squareConfig.methods.includes("afterpay-clearpay") ? (
          <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-medium">Afterpay or Clearpay</h3>
            <div
              id="square-afterpay-clearpay-container"
              className={
                actionUnavailable("afterpay-clearpay")
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
              onClickCapture={
                afterpayClearpayAvailable && !actionUnavailable("afterpay-clearpay")
                  ? () => handleTokenizedMethod("afterpay-clearpay")
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>

      {!isPreflightReady ? (
        <p className="text-sm text-muted-foreground">Confirming the current checkout total...</p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={activeAction !== null}
        >
          Back
        </Button>
      </div>
    </section>
  );
};
