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

    logger.info("Klaviyo request: https://a.klaviyo.com/api/track, ", formParams);

    const response = await fetch("https://a.klaviyo.com/api/track", {
      method: "POST",
      body: formParams,
    });

    logger.info("Klaviyo response: ", response.status, ", ", await response.text());

    return response;
  },
});
