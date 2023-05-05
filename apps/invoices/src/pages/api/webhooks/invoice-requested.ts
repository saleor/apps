import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import {
  InvoiceRequestedPayloadFragment,
  OrderPayloadFragment,
} from "../../../../generated/graphql";
import { createClient } from "../../../lib/graphql";
import { SaleorInvoiceUploader } from "../../../modules/invoices/invoice-uploader/saleor-invoice-uploader";
import { InvoiceCreateNotifier } from "../../../modules/invoices/invoice-create-notifier/invoice-create-notifier";
import {
  InvoiceNumberGenerationStrategy,
  InvoiceNumberGenerator,
} from "../../../modules/invoices/invoice-number-generator/invoice-number-generator";
import { MicroinvoiceInvoiceGenerator } from "../../../modules/invoices/invoice-generator/microinvoice/microinvoice-invoice-generator";
import { hashInvoiceFilename } from "../../../modules/invoices/invoice-file-name/hash-invoice-filename";
import { resolveTempPdfFileLocation } from "../../../modules/invoices/invoice-file-name/resolve-temp-pdf-file-location";
import { createLogger } from "@saleor/apps-shared";
import { SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";
import { GetAppConfigurationV2Service } from "../../../modules/app-configuration/schema-v2/get-app-configuration.v2.service";
import { ShopInfoFetcher } from "../../../modules/shop-info/shop-info-fetcher";
import { z } from "zod";
import { AddressV2Schema } from "../../../modules/app-configuration/schema-v2/app-config-schema.v2";

const OrderPayload = gql`
  fragment Address on Address {
    id
    country {
      country
      code
    }
    companyName
    cityArea
    countryArea
    streetAddress1
    streetAddress2
    postalCode
    phone
    firstName
    lastName
    city
  }

  fragment Money on Money {
    amount
    currency
  }

  fragment TaxedMoney on TaxedMoney {
    currency
    gross {
      ...Money
    }
    net {
      ...Money
    }
    tax {
      ...Money
    }
  }

  fragment OrderPayload on Order {
    shippingPrice {
      ...TaxedMoney
    }
    shippingMethodName
    number

    id
    billingAddress {
      ...Address
    }
    created
    fulfillments {
      created
    }
    status
    number
    total {
      ...TaxedMoney
    }
    channel {
      slug
    }
    lines {
      productName
      variantName
      quantity
      totalPrice {
        ...TaxedMoney
      }
    }
    shippingPrice {
      ...TaxedMoney
    }
    shippingMethodName
  }
`;

export const InvoiceCreatedPayloadFragment = gql`
  ${OrderPayload}

  fragment InvoiceRequestedPayload on InvoiceRequested {
    invoice {
      id
    }
    order {
      ... on Order {
        ...OrderPayload
      }
    }
  }
`;

const InvoiceRequestedSubscription = gql`
  ${InvoiceCreatedPayloadFragment}

  subscription InvoiceRequested {
    event {
      ...InvoiceRequestedPayload
    }
  }
`;

export const invoiceRequestedWebhook = new SaleorAsyncWebhook<InvoiceRequestedPayloadFragment>({
  name: "Invoice requested",
  webhookPath: "api/webhooks/invoice-requested",
  event: "INVOICE_REQUESTED",
  apl: saleorApp.apl,
  query: InvoiceRequestedSubscription,
  onError(error, req, res) {
    const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string;

    const logger = createLogger({ domain: saleorApiUrl });

    logger.error(error);
  },
});

const invoiceNumberGenerator = new InvoiceNumberGenerator();

/**
 * TODO
 * Refactor - extract smaller pieces
 * Test
 * More logs
 * Extract service
 */
export const handler: NextWebhookApiHandler<InvoiceRequestedPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { authData, payload, baseUrl } = context;
  const logger = createLogger({ domain: authData.saleorApiUrl, url: baseUrl });

  const order = payload.order;

  logger.info({ orderId: order.id }, "Received event INVOICE_REQUESTED");
  logger.debug(order, "Order from payload:");

  const orderId = order.id;
  /**
   * TODO -> should generate from generation date or order date?
   */
  const invoiceName = invoiceNumberGenerator.generateFromOrder(
    order as OrderPayloadFragment,
    InvoiceNumberGenerationStrategy.localizedDate("en-US") // todo connect locale -> where from?
  );

  logger.debug({ invoiceName }, "Generated invoice name");

  try {
    const client = createClient(authData.saleorApiUrl, async () =>
      Promise.resolve({ token: authData.token })
    );

    const hashedInvoiceName = hashInvoiceFilename(invoiceName, orderId);

    logger.debug({ hashedInvoiceName });

    const hashedInvoiceFileName = `${hashedInvoiceName}.pdf`;
    const tempPdfLocation = await resolveTempPdfFileLocation(hashedInvoiceFileName);

    logger.debug({ tempPdfLocation }, "Resolved PDF location for temporary files");

    const config = await new GetAppConfigurationV2Service({
      saleorApiUrl: authData.saleorApiUrl,
      apiClient: client,
    }).getConfiguration();

    // todo extract
    const address: z.infer<typeof AddressV2Schema> | null =
      config.getChannelsOverrides()[order.channel.slug] ??
      (await new ShopInfoFetcher(client).fetchShopInfo().then((r) => {
        if (!r?.companyAddress) {
          return null;
        }

        return {
          city: r.companyAddress.city,
          cityArea: r.companyAddress.cityArea,
          companyName: r.companyAddress.companyName,
          country: r.companyAddress.country.country,
          countryArea: r.companyAddress.countryArea,
          postalCode: r.companyAddress.postalCode,
          streetAddress1: r.companyAddress.streetAddress1,
          streetAddress2: r.companyAddress.streetAddress2,
        } satisfies z.infer<typeof AddressV2Schema>;
      }));

    if (!address) {
      // todo disable webhook

      return res.status(200).end("App not configured");
    }

    await new MicroinvoiceInvoiceGenerator()
      .generate({
        order,
        invoiceNumber: invoiceName,
        filename: tempPdfLocation,
        companyAddressData: address,
      })
      .catch((err) => {
        logger.error(err, "Error generating invoice");

        return res.status(500).json({
          error: "Error generating invoice",
        });
      });

    const uploader = new SaleorInvoiceUploader(client);

    const uploadedFileUrl = await uploader.upload(tempPdfLocation, `${invoiceName}.pdf`);

    logger.info({ uploadedFileUrl }, "Uploaded file to storage, will notify Saleor now");

    await new InvoiceCreateNotifier(client).notifyInvoiceCreated(
      orderId,
      invoiceName,
      uploadedFileUrl
    );
  } catch (e) {
    logger.error(e);

    return res.status(500).json({
      error: (e as any)?.message ?? "Error",
    });
  }

  logger.info("Success");

  return res.status(200).end();
};

export default invoiceRequestedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
