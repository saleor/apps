import { OrderCreatedWebhookPayloadFragment } from "../../generated/graphql";

export const sendSlackMessage = async (
  to: string,
  data: {
    order: Exclude<OrderCreatedWebhookPayloadFragment["order"], undefined | null>;
    saleorDomain: string;
  }
) => {
  const {
    saleorDomain,
    order: { id, number, user, shippingAddress, subtotal, shippingPrice, total },
  } = data;

  const response = await fetch(to, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Order <https://${saleorDomain}/dashboard/orders/${id}|#${number}> has been created 🎉`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Customer*\n${user?.firstName} ${user?.lastName}\n${user?.email}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Shipping Address*\n${shippingAddress?.streetAddress1}\n${shippingAddress?.postalCode} ${shippingAddress?.city}\n${shippingAddress?.country.country}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Subtotal*\n${subtotal.gross.amount} ${subtotal.gross.currency}\n*Shipping*\n${shippingPrice.gross.amount} ${shippingPrice.gross.currency}\n*Total*\n${total.gross.amount} ${total.gross.currency}`,
          },
        },
      ],
    }),
  });

  return response;
};
