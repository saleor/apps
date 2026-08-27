import { STRIPE_APP_IDENTIFIER } from "./app-identifiers";
import { type CommerceTaskId, type StoreReadiness } from "./get-store-readiness";
import { type AppRedirectTarget, INSTALLED_APPS_PATH } from "./redirect-target";

export type TaskCopy = {
  title: string;
  description: string;
  details: string;
  ctaLabel: string;
  requirement?: string;
};

/**
 * Merchant-facing copy for commerce steps.
 * Locked / permission wording mirrors ChannelSetupCard where possible.
 */
export const getTaskCopy = (id: CommerceTaskId, readiness: StoreReadiness): TaskCopy => {
  switch (id) {
    case "sales-channel": {
      if (!readiness.channelsKnown) {
        return {
          title: "Set up your sales channel",
          description:
            "You need channel permissions to create or finish a sales channel (where you sell — currency, stock, and shipping).",
          details:
            "A sales channel is Saleor’s market setup — currency, stock location, and shipping. Ask an admin for Manage channels, then finish Inventory and Delivery on the channel page.",
          ctaLabel: "Create channel",
          requirement: "Missing permission to manage channels",
        };
      }

      if (!readiness.hasChannels) {
        return {
          title: "Set up your sales channel",
          description:
            "Create a sales channel — where you sell — with currency, stock, and shipping.",
          details:
            "A sales channel is where you sell (Saleor’s equivalent of a Shopify market/store). You’ll add a stock location and shipping next on the channel page so customers can check out.",
          ctaLabel: "Create channel",
        };
      }

      if (!readiness.hasWarehouse) {
        return {
          title: "Set up your sales channel",
          description: readiness.channelName
            ? `Add a stock location so ${readiness.channelName} can allocate inventory.`
            : "Add a stock location so this channel can allocate inventory.",
          details:
            "Inventory is tracked per warehouse. Without one assigned to your sales channel, checkout can’t allocate stock for tracked products.",
          ctaLabel: "Continue setup",
          requirement: "Needs a stock location",
        };
      }

      /*
       * Match ChannelSetupCard: skipped shipping query (no MANAGE_SHIPPING) does not
       * block readiness, but copy must not claim shipping is configured.
       */
      if (!readiness.shippingKnown) {
        return {
          title: "Set up your sales channel",
          description: readiness.channelName
            ? `${readiness.channelName} has a stock location. Shipping couldn’t be verified (needs Manage shipping).`
            : "Stock location is ready. Shipping couldn’t be verified (needs Manage shipping).",
          details:
            "You need shipping permissions to create or assign zones for this sales channel. Ask an admin for Manage shipping, then finish Delivery on the channel page.",
          ctaLabel: "Continue setup",
        };
      }

      if (!readiness.hasShipping) {
        return {
          title: "Set up your sales channel",
          description: readiness.channelName
            ? `Add shipping so customers can check out on ${readiness.channelName}.`
            : "Add shipping so customers can check out.",
          details:
            "Shipping zones define which countries you deliver to and which rates customers see at checkout. Assign your sales channel to a zone that covers your market.",
          ctaLabel: "Continue setup",
          requirement: "Needs shipping",
        };
      }

      return {
        title: "Set up your sales channel",
        description: readiness.channelName
          ? `${readiness.channelName} has stock and shipping.`
          : "Your sales channel has stock and shipping.",
        details:
          "A sales channel is where you sell — currency, stock, and shipping. You can refine Inventory and Delivery anytime on the channel page.",
        ctaLabel: "Continue setup",
      };
    }
    case "first-product": {
      if (!readiness.productsKnown) {
        return {
          title: "Add your first product",
          description: "You need product permissions to create a listing.",
          details:
            "After creating a product, publish it to your sales channel and set a price and stock. Ask an admin for Manage products if you can’t open product create.",
          ctaLabel: "Add product",
          requirement: "Missing permission to manage products",
        };
      }

      return {
        title: "Add your first product",
        description: readiness.hasProduct
          ? "Your catalog has at least one product."
          : "Create a product with a price so you have something to sell.",
        details:
          "After creating a product, publish it to your sales channel and set a price and stock. Channel setup can help with bulk publish.",
        ctaLabel: "Add product",
        requirement: !readiness.channelReady ? "Requires a sales channel" : undefined,
      };
    }
    case "payments": {
      if (!readiness.paymentsKnown) {
        return {
          title: "Connect payments",
          description: "You need apps permissions to install a payment app.",
          details:
            "Saleor processes payments through extensions. Ask an admin for Manage apps, then install a payment app (or Dummy Payment to simulate checkouts).",
          ctaLabel: "Set up payments",
          requirement: "Missing permission to manage apps",
        };
      }

      return {
        title: "Connect payments",
        description: readiness.hasPaymentApp
          ? "A payment app is installed and active."
          : "Install Dummy Payment to test checkout, or a real payment app for live charges.",
        details:
          "Saleor processes payments through extensions — similar to Shopify apps. On Cloud and local dev, Dummy Payment is the fastest way to simulate checkouts; switch to a PSP before going live.",
        ctaLabel: "Set up payments",
        requirement: !readiness.hasProduct ? "Requires a product" : undefined,
      };
    }
    case "test-order":
      return {
        title: "Place a test order",
        description: readiness.hasOrder
          ? "You’ve already received an order."
          : "Optional — prove the flow end-to-end with a test checkout.",
        details:
          "Use your storefront or API with Dummy Payment to place a test order, then confirm it appears under Orders.",
        ctaLabel: "View orders",
      };
  }
};

export const getTaskCta = (id: CommerceTaskId, readiness: StoreReadiness): AppRedirectTarget => {
  switch (id) {
    case "sales-channel":
      if (readiness.channelId) {
        return { kind: "dashboard", to: `/channels/${encodeURIComponent(readiness.channelId)}` };
      }

      return { kind: "dashboard", to: "/channels/?action=create" };
    case "first-product":
      return { kind: "dashboard", to: "/products/add" };
    case "payments":
      if (readiness.hasStripeApp) {
        return {
          kind: "app",
          appIdentifier: STRIPE_APP_IDENTIFIER,
          fallbackTo: INSTALLED_APPS_PATH,
        };
      }

      return { kind: "dashboard", to: INSTALLED_APPS_PATH };
    case "test-order":
      return { kind: "dashboard", to: "/orders/" };
  }
};

export const getTaskPermission = (id: CommerceTaskId): string | undefined => {
  switch (id) {
    case "sales-channel":
      return "MANAGE_CHANNELS";
    case "first-product":
      return "MANAGE_PRODUCTS";
    case "payments":
      return "MANAGE_APPS";
    case "test-order":
      return undefined;
  }
};
