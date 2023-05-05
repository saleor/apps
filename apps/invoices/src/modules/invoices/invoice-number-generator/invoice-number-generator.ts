import { OrderPayloadFragment } from "../../../../generated/graphql";

interface IInvoiceNumberGenerationStrategy {
  (order: OrderPayloadFragment): string;
}

export const InvoiceNumberGenerationStrategy = {
  localizedDate: (locale: string) => (order: Pick<OrderPayloadFragment, "created">) => {
    const orderCreatedDate = new Date(order.created);

    return Intl.DateTimeFormat(locale).format(orderCreatedDate);
  },
} satisfies Record<string, (...args: any[]) => IInvoiceNumberGenerationStrategy>;

export class InvoiceNumberGenerator {
  generateFromOrder(
    order: OrderPayloadFragment,
    strategy: IInvoiceNumberGenerationStrategy
  ): string {
    return strategy(order);
  }
}
