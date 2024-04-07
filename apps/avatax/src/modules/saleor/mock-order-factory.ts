import { SaleorOrder } from "./order";

export class SaleorMockOrderFactory {
  private static getData = (pricesEnteredWithTax: boolean) => ({
    order: {
      channel: {
        taxConfiguration: {
          pricesEnteredWithTax,
          taxCalculationStrategy: "TAX_APP" as const,
        },
        slug: "test",
      },
      status: "UNCONFIRMED",
      id: "test",
    },
  });

  public static create({ pricesEnteredWithTax }: { pricesEnteredWithTax: boolean }) {
    const data = SaleorMockOrderFactory.getData(pricesEnteredWithTax);

    return new SaleorOrder(data);
  }
}
