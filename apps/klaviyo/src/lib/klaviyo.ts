import { createLogger } from "../logger";

const logger = createLogger("Klaviyo client");

interface EmailServiceProvider {
  send: (event: string, recipient: string, context: any) => Promise<Response>;
}

export const Klaviyo = (token: string): EmailServiceProvider => ({
  send: async (event, recipient, context) => {
    const formParams = new URLSearchParams();

    formParams.append(
      "data",
      JSON.stringify({
        token,
        event,
        customer_properties: { $email: recipient },
        properties: context,
      }),
    );

    logger.info("Seding Klaviyo request", { url: "https://a.klaviyo.com/api/track" });

    const response = await fetch("https://a.klaviyo.com/api/track", {
      method: "POST",
      body: formParams,
    });

    logger.info("Klaviyo responded with status", { status: response.status });

    return response;
  },
});
