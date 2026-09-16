import { parse, print } from "graphql";
import { describe, expect, it } from "vitest";

import { orderCreatedWebhook } from "../../pages/api/webhooks/order-created";
import { removeUnsupportedInlineFragments } from "./remove-unsupported-inline-fragments";

describe("removeUnsupportedInlineFragments", () => {
  it("Strips the 3.23-only GiftCardPaymentMethodDetails from the real ORDER_CREATED subscription", () => {
    const query = orderCreatedWebhook.getWebhookManifest("https://example.com").query!;

    expect(query).toContain("GiftCardPaymentMethodDetails");

    const stripped = removeUnsupportedInlineFragments(query, ["GiftCardPaymentMethodDetails"]);

    expect(stripped).not.toContain("GiftCardPaymentMethodDetails");
    expect(stripped).not.toContain("lastChars");
    // fields supported by 3.22 are kept
    expect(stripped).toContain("CardPaymentMethodDetails");
    expect(stripped).toContain("lastDigits");
    // result is still a parseable document
    expect(() => parse(stripped)).not.toThrow();

    /**
     * The snapshot is the exact query registered in Saleor 3.22 - review it by hand when the
     * ORDER_CREATED payload changes, it is what merchants on 3.22 actually receive.
     */
    expect(stripped).toMatchInlineSnapshot(`
      "subscription OrderCreated {
        event {
          ...OrderCreatedWebhookPayload
        }
      }

      fragment OrderCreatedWebhookPayload on OrderCreated {
        order {
          ...OrderDetails
        }
      }

      fragment OrderDetails on Order {
        id
        number
        status
        languageCodeEnum
        userEmail
        created
        redirectUrl
        channel {
          slug
          name
        }
        metadata {
          key
          value
        }
        privateMetadata {
          key
          value
        }
        user {
          email
          firstName
          lastName
          languageCode
        }
        billingAddress {
          firstName
          lastName
          companyName
          streetAddress1
          streetAddress2
          city
          cityArea
          postalCode
          countryArea
          country {
            country
          }
          phone
        }
        shippingAddress {
          firstName
          lastName
          companyName
          streetAddress1
          streetAddress2
          city
          cityArea
          postalCode
          countryArea
          country {
            country
          }
          phone
        }
        lines {
          id
          isShippingRequired
          metadata {
            key
            value
          }
          privateMetadata {
            key
            value
          }
          productName
          translatedProductName
          variantName
          translatedVariantName
          productSku
          variant {
            preorder {
              endDate
            }
            weight {
              unit
              value
            }
            attributes {
              attribute {
                id
                name
                slug
              }
              values {
                id
                name
                slug
                file {
                  url
                  contentType
                }
              }
            }
            product {
              attributes {
                attribute {
                  id
                  name
                  slug
                }
                values {
                  id
                  name
                  slug
                  file {
                    url
                    contentType
                  }
                }
              }
            }
          }
          quantity
          quantityFulfilled
          taxRate
          thumbnail {
            url
            alt
          }
          unitPrice {
            gross {
              currency
              amount
            }
            net {
              currency
              amount
            }
            tax {
              currency
              amount
            }
          }
          totalPrice {
            gross {
              currency
              amount
            }
            net {
              currency
              amount
            }
            tax {
              currency
              amount
            }
          }
          unitDiscount {
            currency
            amount
          }
          unitDiscountReason
          unitDiscountType
          unitDiscountValue
          undiscountedUnitPrice {
            gross {
              currency
              amount
            }
            net {
              currency
              amount
            }
            tax {
              currency
              amount
            }
          }
        }
        subtotal {
          gross {
            amount
            currency
          }
          net {
            currency
            amount
          }
          tax {
            currency
            amount
          }
        }
        shippingPrice {
          gross {
            amount
            currency
          }
          net {
            currency
            amount
          }
          tax {
            currency
            amount
          }
        }
        total {
          gross {
            amount
            currency
          }
          net {
            currency
            amount
          }
          tax {
            currency
            amount
          }
        }
        undiscountedTotal {
          gross {
            amount
            currency
          }
          net {
            currency
            amount
          }
          tax {
            currency
            amount
          }
        }
        displayGrossPrices
        isShippingRequired
        shippingMethodName
        transactions {
          chargedAmount {
            amount
            currency
          }
          authorizedAmount {
            amount
            currency
          }
          paymentMethodDetails {
            __typename
            name
            ... on CardPaymentMethodDetails {
              brand
              lastDigits
              expMonth
              expYear
            }
            ... on OtherPaymentMethodDetails {
              name
            }
          }
        }
      }"
    `);
  });

  it("Leaves the query untouched when nothing is unsupported", () => {
    const query = `subscription S { event { ... on OrderCreated { order { id } } } }`;

    expect(removeUnsupportedInlineFragments(query, ["GiftCardPaymentMethodDetails"])).toBe(
      print(parse(query)),
    );
  });
});
