import { SyncWebhookTransactionFragment } from "@/generated/graphql";

export class TransactionPspFinder {
  findLastPspReference(transaction: Pick<SyncWebhookTransactionFragment, "events">): string | null {
    const events = transaction.events ?? [];

    const event = events.find((event) => !!event.pspReference);

    if (event) {
      return event.pspReference;
    }

    return null;
  }
}
