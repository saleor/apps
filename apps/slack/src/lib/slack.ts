import { OrderCreatedWebhookPayloadFragment } from "../../generated/graphql";

export const sendSlackMessage = async (
  to: string,
  data: {
    order: Exclude<OrderCreatedWebhookPayloadFragment["order"], undefined | null>;
    saleorApiUrl: string;
  }
) => {
  const {
    saleorApiUrl,
    order: {
      id,
      number,
      user,
      shippingAddress,
      subtotal,
      shippingPrice,
      total,
      billingAddress,
      userEmail,
    },
  } = data;

  const getCustomerName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else {
      return `n/a`;
    }
  };

  const dashboardUrl = saleorApiUrl.replace("/graphql/", "/dashboard/");

  const response = await fetch(to, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Order <${dashboardUrl}/orders/${id}|#${number}> has been created 🎉`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Customer*\n${getCustomerName()}\nEmail: ${userEmail}`,
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
            text: `*Billing Address*\n${billingAddress?.streetAddress1}\n${billingAddress?.postalCode} ${billingAddress?.city}\n${billingAddress?.country.country}`,
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
