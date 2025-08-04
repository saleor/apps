import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/error";

import { ReportOrderNoteDocument } from "../../../generated/graphql";

export class OrderNoteReporter {
  static Error = BaseError.subclass("OrderNoteReporterError");

  constructor(private client: Client) {}

  async reportOrderNote(orderId: string, note: string): Promise<Result<null, Error>> {
    try {
      const result = await this.client.mutation(ReportOrderNoteDocument, {
        orderId,
        note,
      });

      const error = result.error ?? result.data?.orderNoteAdd?.errors[0];

      if (error) {
        return err(
          new OrderNoteReporter.Error("Failed to report order note", {
            cause: error,
          }),
        );
      }

      return ok(null);
    } catch (e) {
      return err(
        new OrderNoteReporter.Error("Failed to execute network request", {
          cause: e,
        }),
      );
    }
  }
}
