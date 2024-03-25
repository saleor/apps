import { SaleorOrder } from "./order";

export class SaleorOrderFactory {
  private static getData = (pricesEnteredWithTax: boolean) => ({
    order: {
      channel: {
        taxConfiguration: {
          pricesEnteredWithTax,
        },
        slug: "test",
      },
      status: "UNCONFIRMED",
      id: "test",
    },
  });

  public static create({ pricesEnteredWithTax }: { pricesEnteredWithTax: boolean }) {
    const data = SaleorOrderFactory.getData(pricesEnteredWithTax);

    return new SaleorOrder(data);
  }
}
