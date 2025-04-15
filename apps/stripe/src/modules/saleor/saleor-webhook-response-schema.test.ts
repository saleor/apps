import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createFailureWebhookResponseDataSchema,
  createSuccessWebhookResponseDataSchema,
} from "./saleor-webhook-response-schema";

describe("Webhook Response Schema", () => {
  describe("createSuccessWebhookResponseDataSchema", () => {
    it("creates schema that validates successful response data", () => {
      const testSchema = z.object({
        field: z.string(),
      });

      const schema = createSuccessWebhookResponseDataSchema(testSchema);
      const result = schema.safeParse({
        paymentIntent: {
          field: "test-value",
        },
      });

      expect(result.success).toBe(true);
    });

    it("returns error when data doesn't match schema", () => {
      const testSchema = z.object({
        field: z.string(),
      });

      const schema = createSuccessWebhookResponseDataSchema(testSchema);
      const result = schema.safeParse({
        paymentIntent: {
          field: 123, // Should be string
        },
      });

      expect(result.success).toBe(false);
    });

    it("returns error when paymentIntent field is missing", () => {
      const testSchema = z.object({
        field: z.string(),
      });

      const schema = createSuccessWebhookResponseDataSchema(testSchema);
      const result = schema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("createFailureWebhookResponseDataSchema", () => {
    it("creates schema that validates failure response data with errors", () => {
      const errorsSchema = z.array(
        z.object({
          code: z.string(),
          message: z.string(),
        }),
      );

      const schema = createFailureWebhookResponseDataSchema(errorsSchema);
      const result = schema.safeParse({
        paymentIntent: {
          errors: [
            {
              code: "ERROR_CODE",
              message: "Error message",
            },
          ],
        },
      });

      expect(result.success).toBe(true);
    });

    it("returns error when errors array doesn't match schema", () => {
      const errorsSchema = z.array(
        z.object({
          code: z.string(),
          message: z.string(),
        }),
      );

      const schema = createFailureWebhookResponseDataSchema(errorsSchema);
      const result = schema.safeParse({
        paymentIntent: {
          errors: [
            {
              code: 123, // Should be string
              message: "Error message",
            },
          ],
        },
      });

      expect(result.success).toBe(false);
    });

    it("returns error when paymentIntent field is missing", () => {
      const errorsSchema = z.array(
        z.object({
          code: z.string(),
          message: z.string(),
        }),
      );

      const schema = createFailureWebhookResponseDataSchema(errorsSchema);
      const result = schema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});
