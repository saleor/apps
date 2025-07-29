import { beforeEach, describe, expect, it } from "vitest";

import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { OrderGrantedRefundFragment, SourceObjectFragment } from "@/generated/graphql";

import {
  PartialRefundWithLineItemsGoodsBuilder,
  PartialRefundWithoutLineItemsGoodsBuilder,
} from "./refund-goods-builders";

describe("PartialRefundWithoutLineItemsGoodsBuilder", () => {
  let builder: PartialRefundWithoutLineItemsGoodsBuilder;

  beforeEach(() => {
    builder = new PartialRefundWithoutLineItemsGoodsBuilder();
  });

  it("should exclude discount line when amountAdjusted is 0", () => {
    const result = builder.build({
      sourceObject: mockedSourceObject,
      useSkuAsName: false,
      amountAfterRefund: 0,
    });

    const [productLine] = mockedSourceObject.lines;

    expect(result).toStrictEqual([
      {
        goods_name: "Product Name",
        goods_price: productLine.unitPrice.gross.amount,
        quantity: productLine.quantity,
      },
      {
        goods_name: "Voucher",
        goods_price: mockedSourceObject.discount.amount,
        quantity: 1,
      },
      {
        goods_name: "Shipping",
        goods_price: mockedSourceObject.shippingPrice.gross.amount,
        quantity: 1,
      },
    ]);
  });

  it("should add discount line based on amountAfterRefund", () => {
    const refundToApply = 300;
    const result = builder.build({
      sourceObject: mockedSourceObject,
      useSkuAsName: false,
      amountAfterRefund: refundToApply,
    });

    const [productLine] = mockedSourceObject.lines;

    expect(result).toStrictEqual([
      {
        goods_name: "Product Name",
        goods_price: productLine.unitPrice.gross.amount,
        quantity: productLine.quantity,
      },
      {
        goods_name: "Voucher",
        goods_price: mockedSourceObject.discount.amount,
        quantity: 1,
      },
      {
        goods_name: "Shipping",
        goods_price: mockedSourceObject.shippingPrice.gross.amount,
        quantity: 1,
      },
      {
        goods_name: "Discount",
        goods_price: -refundToApply,
        quantity: 1,
      },
    ]);
  });

  it("should properly parse sourceObject into goods", () => {
    const result = builder.build({
      sourceObject: mockedSourceObject,
      useSkuAsName: false,
      amountAfterRefund: 0,
    });

    expect(result).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Voucher",
            "goods_price": 78,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 137,
            "quantity": 1,
          },
        ]
      `);
  });
});

describe("PartialRefundWithLineItemsGoodsBuilder", () => {
  let builder: PartialRefundWithLineItemsGoodsBuilder;

  beforeEach(() => {
    builder = new PartialRefundWithLineItemsGoodsBuilder();
  });

  const mockSourceObject: SourceObjectFragment = {
    __typename: "Order",
    id: "order-id",
    channel: {
      id: "channel-id",
      slug: "default-channel",
      currencyCode: "JPY",
    },
    total: {
      gross: {
        amount: 4100,
      },
    },
    lines: [
      {
        id: "line-1",
        __typename: "OrderLine",
        quantity: 3,
        unitPrice: {
          gross: {
            amount: 1000,
          },
        },
        orderVariant: {
          product: {
            name: "Test Product 1",
          },
          sku: "TEST-SKU-1",
        },
      },
      {
        id: "line-2",
        __typename: "OrderLine",
        quantity: 2,
        unitPrice: {
          gross: {
            amount: 500,
          },
        },
        orderVariant: {
          product: {
            name: "Test Product 2",
          },
          sku: "TEST-SKU-2",
        },
      },
      {
        id: "line-3",
        __typename: "OrderLine",
        quantity: 1,
        unitPrice: {
          gross: {
            amount: 800,
          },
        },
        orderVariant: {
          product: {
            name: "Test Product 3",
          },
          sku: "TEST-SKU-3",
        },
      },
    ],
    discount: {
      amount: 100,
    },
    shippingPrice: {
      gross: {
        amount: 200,
      },
    },
  } as SourceObjectFragment;

  it("should build goods with reduced quantities for refunded lines", () => {
    const grantedRefund = {
      lines: [
        {
          orderLine: {
            id: "line-1",
          },
          quantity: 1,
        },
        {
          orderLine: {
            id: "line-2",
          },
          quantity: 2,
        },
      ],
      shippingCostsIncluded: false,
    } satisfies OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    const [productLine1, _refundedProductLine2, productLine3] = mockSourceObject.lines;

    expect(result).toStrictEqual([
      {
        goods_name: "Test Product 1",
        goods_price: productLine1.unitPrice.gross.amount,
        quantity: productLine1.quantity - grantedRefund.lines[0].quantity, // two lines were refunded here
      },
      {
        goods_name: "Test Product 3",
        goods_price: productLine3.unitPrice.gross.amount,
        quantity: productLine3.quantity, // Not refunded, remains 1
      },
      {
        goods_name: "Voucher",
        goods_price: mockSourceObject.discount?.amount,
        quantity: 1,
      },
      {
        goods_name: "Shipping",
        goods_price: mockSourceObject.shippingPrice.gross.amount,
        quantity: 1,
      },
    ]);
  });

  it("should exclude lines that are fully refunded", () => {
    const grantedRefund = {
      lines: [
        {
          orderLine: {
            id: "line-2",
          },
          quantity: 2, // Fully refunded
        },
        {
          orderLine: {
            id: "line-3",
          },
          quantity: 1, // Fully refunded
        },
      ],
      shippingCostsIncluded: false,
    } satisfies OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    const [productLine1] = mockSourceObject.lines;

    expect(result).toStrictEqual([
      {
        goods_name: "Test Product 1",
        goods_price: productLine1.unitPrice.gross.amount,
        quantity: productLine1.quantity, // Not refunded
      },
      {
        goods_name: "Voucher",
        goods_price: mockSourceObject.discount?.amount,
        quantity: 1,
      },
      {
        goods_name: "Shipping",
        goods_price: mockSourceObject.shippingPrice.gross.amount,
        quantity: 1,
      },
    ]);
  });

  it("should include shipping discount when shippingCostsIncluded is true", () => {
    const grantedRefund = {
      lines: [
        {
          orderLine: {
            id: "line-1",
          },
          quantity: 1,
        },
      ],
      shippingCostsIncluded: true,
    } satisfies OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    const [productLine1, productLine2, productLine3] = mockSourceObject.lines;

    expect(result).toStrictEqual([
      {
        goods_name: "Test Product 1",
        goods_price: productLine1.unitPrice.gross.amount,
        quantity: productLine1.quantity - grantedRefund.lines[0].quantity, // 1 line refunded
      },
      {
        goods_name: "Test Product 2",
        goods_price: productLine2.unitPrice.gross.amount,
        quantity: productLine2.quantity,
      },
      {
        goods_name: "Test Product 3",
        goods_price: productLine3.unitPrice.gross.amount,
        quantity: productLine3.quantity,
      },
      {
        goods_name: "Voucher",
        goods_price: mockSourceObject.discount?.amount,
        quantity: 1,
      },
      {
        goods_name: "Shipping",
        goods_price: mockSourceObject.shippingPrice.gross.amount,
        quantity: 1,
      },
      {
        goods_name: "Discount",
        goods_price: -mockSourceObject.shippingPrice.gross.amount, // Shipping amount as discount
        quantity: 1,
      },
    ]);
  });

  it("should not include shipping discount when shippingCostsIncluded is false", () => {
    const grantedRefund = {
      lines: [
        {
          orderLine: {
            id: "line-1",
          },
          quantity: 1,
        },
      ],
      shippingCostsIncluded: false,
    } satisfies OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    const [productLine1, productLine2, productLine3] = mockSourceObject.lines;

    expect(result).toStrictEqual([
      {
        goods_name: "Test Product 1",
        goods_price: 1000,
        quantity: productLine1.quantity - grantedRefund.lines[0].quantity, // 1 line refunded
      },
      {
        goods_name: "Test Product 2",
        goods_price: 500,
        quantity: productLine2.quantity,
      },
      {
        goods_name: "Test Product 3",
        goods_price: 800,
        quantity: productLine3.quantity,
      },
      {
        goods_name: "Voucher",
        goods_price: mockSourceObject.discount?.amount,
        quantity: 1,
      },
      {
        goods_name: "Shipping",
        goods_price: mockSourceObject.shippingPrice.gross.amount,
        quantity: 1,
      },
    ]);
  });

  it("should handle empty granted refund lines", () => {
    const grantedRefund: OrderGrantedRefundFragment = {
      lines: [],
      shippingCostsIncluded: false,
    } as OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    // All original lines should remain unchanged
    expect(result).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Test Product 1",
            "goods_price": 1000,
            "quantity": 3,
          },
          {
            "goods_name": "Test Product 2",
            "goods_price": 500,
            "quantity": 2,
          },
          {
            "goods_name": "Test Product 3",
            "goods_price": 800,
            "quantity": 1,
          },
          {
            "goods_name": "Voucher",
            "goods_price": 100,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 200,
            "quantity": 1,
          },
        ]
      `);
  });

  it("should handle null granted refund lines", () => {
    const grantedRefund: OrderGrantedRefundFragment = {
      lines: null,
      shippingCostsIncluded: false,
    } as OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    // All original lines should remain unchanged
    expect(result).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Test Product 1",
            "goods_price": 1000,
            "quantity": 3,
          },
          {
            "goods_name": "Test Product 2",
            "goods_price": 500,
            "quantity": 2,
          },
          {
            "goods_name": "Test Product 3",
            "goods_price": 800,
            "quantity": 1,
          },
          {
            "goods_name": "Voucher",
            "goods_price": 100,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 200,
            "quantity": 1,
          },
        ]
      `);
  });

  it("should handle refund lines that don't match any order lines", () => {
    const grantedRefund: OrderGrantedRefundFragment = {
      lines: [
        {
          orderLine: {
            id: "non-existent-line",
          },
          quantity: 1,
        },
      ],
      shippingCostsIncluded: false,
    } as OrderGrantedRefundFragment;

    const result = builder.build({
      sourceObject: mockSourceObject,
      useSkuAsName: false,
      grantedRefund,
    });

    // All original lines should remain unchanged since no matching refund lines
    expect(result).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Test Product 1",
            "goods_price": 1000,
            "quantity": 3,
          },
          {
            "goods_name": "Test Product 2",
            "goods_price": 500,
            "quantity": 2,
          },
          {
            "goods_name": "Test Product 3",
            "goods_price": 800,
            "quantity": 1,
          },
          {
            "goods_name": "Voucher",
            "goods_price": 100,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 200,
            "quantity": 1,
          },
        ]
      `);
  });
});
