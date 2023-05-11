import { InvoiceGenerator } from "../invoice-generator";
import { Order, OrderPayloadFragment } from "../../../../../generated/graphql";
import { SellerShopConfig } from "../../../app-configuration/schema-v1/app-config-v1";
import { AddressV2Shape } from "../../../app-configuration/schema-v2/app-config-schema.v2";
const Microinvoice = require("microinvoice");

export class MicroinvoiceInvoiceGenerator implements InvoiceGenerator {
  constructor(
    private settings = {
      locale: "en-US",
    }
  ) {}
  async generate(input: {
    order: OrderPayloadFragment;
    invoiceNumber: string;
    filename: string;
    companyAddressData: AddressV2Shape;
  }): Promise<void> {
    const { invoiceNumber, order, companyAddressData, filename } = input;

    const microinvoiceInstance = new Microinvoice({
      style: {
        /*
         * header: {
         *   image: {
         *     path: "./examples/logo.png",
         *     width: 50,
         *     height: 19,
         *   },
         * },
         */
      },
      data: {
        invoice: {
          name: `Invoice ${invoiceNumber}`,

          header: [
            {
              label: "Order number",
              value: order.number,
            },
            {
              label: "Date",
              value: Intl.DateTimeFormat(this.settings.locale, {
                dateStyle: "medium",
                timeStyle: "medium",
              }).format(new Date(order.created)),
            },
          ],

          currency: order.total.currency,

          customer: [
            {
              label: "Customer",
              value: [
                `${order.billingAddress?.firstName} ${order.billingAddress?.lastName}`,
                order.billingAddress?.companyName,
                order.billingAddress?.phone,
                `${order.billingAddress?.streetAddress1}`,
                `${order.billingAddress?.streetAddress2}`,
                `${order.billingAddress?.postalCode} ${order.billingAddress?.city}`,
                order.billingAddress?.country.country,
              ],
            },
            /*
             * {
             *   label: "Tax Identifier",
             *   value: "todo",
             * },
             */
          ],

          seller: [
            {
              label: "Seller",
              value: [
                companyAddressData.companyName,
                companyAddressData.streetAddress1,
                companyAddressData.streetAddress2,
                `${companyAddressData.postalCode} ${companyAddressData.city}`,
                companyAddressData.cityArea,
                companyAddressData.country,
                companyAddressData.countryArea,
              ],
            },
            /*
             * {
             *   label: "Tax Identifier",
             *   value: "todo",
             * },
             */
          ],

          legal: [
            /*
             * {
             *   value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
             *   weight: "bold",
             *   color: "primary",
             * },
             * {
             *   value: "sed do eiusmod tempor incididunt ut labore et dolore magna.",
             *   weight: "bold",
             *   color: "secondary",
             * },
             */
          ],

          details: {
            header: [
              {
                value: "Description",
              },
              {
                value: "Quantity",
              },
              {
                value: "Subtotal",
              },
            ],

            parts: [
              ...order.lines.map((line) => {
                return [
                  {
                    value: line.productName,
                  },
                  {
                    value: line.quantity,
                  },
                  {
                    value: line.totalPrice.gross.amount,
                    price: true,
                  },
                ];
              }),
              [
                {
                  value: order.shippingMethodName,
                },
                {
                  value: "-",
                },
                {
                  value: order.shippingPrice.gross.amount,
                  price: true,
                },
              ],
            ],

            total: [
              {
                label: "Total net",
                value: order.total.net.amount,
                price: true,
              },
              {
                label: "Tax value",
                value: order.total.tax.amount,
                price: true,
              },
              {
                label: "Total with tax",
                value: order.total.gross.amount,
                price: true,
              },
            ],
          },
        },
      },
    });

    return microinvoiceInstance.generate(filename);
  }
}
