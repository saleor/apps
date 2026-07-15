import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { saleorApp } from "../../../saleor-app";
import {
  smtpConfigurationRouter,
  throwTrpcErrorFromConfigurationServiceError,
} from "./smtp-configuration.router";
import { SmtpConfigurationService } from "./smtp-configuration.service";

const validMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Order {{ order.number }}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const mockSaleorApiUrl = "https://test.saleor.io/graphql/";

/**
 * Helper to create a caller for the tRPC router, without calling it via http
 */
const createCaller = () => {
  return smtpConfigurationRouter.createCaller({
    saleorApiUrl: mockSaleorApiUrl,
    token: "mock-token",
    ssr: true,
    appId: "app:id",
    baseUrl: "",
  });
};

describe("smtpConfigurationRouter", () => {
  beforeEach(() => {
    // Mock the APL to return auth data for protected procedures
    vi.spyOn(saleorApp.apl, "get").mockResolvedValue({
      saleorApiUrl: mockSaleorApiUrl,
      token: "mock-token",
      appId: "mock-app-id",
    });
  });

  describe("renderTemplate", () => {
    describe("happy paths", () => {
      it("should render valid subject and template successfully", async () => {
        const caller = createCaller();

        const result = await caller.renderTemplate({
          subject: "Order {{ order.number }}",
          template: validMjmlTemplate,
          payload: JSON.stringify({ order: { number: "123" } }),
        });

        expect(result.renderedSubject).toBe("Order 123");
        expect(result.renderedEmailBody).toContain("Order 123");
        expect(result.renderedEmailBody).toContain("<!doctype html>");
      });

      it("should render subject with variables correctly", async () => {
        const caller = createCaller();

        const result = await caller.renderTemplate({
          subject: "Order {{ order.number }} - Customer {{ customer.name }}",
          template: validMjmlTemplate,
          payload: JSON.stringify({
            order: { number: "456" },
            customer: { name: "John Doe" },
          }),
        });

        expect(result.renderedSubject).toBe("Order 456 - Customer John Doe");
        expect(result.renderedEmailBody).toContain("Order 456");
      });

      it("should render template with multiple variables", async () => {
        const caller = createCaller();

        const multiVarTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Order {{ order.number }} for {{ customer.email }}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

        const result = await caller.renderTemplate({
          subject: "Order {{ order.number }}",
          template: multiVarTemplate,
          payload: JSON.stringify({
            order: { number: "789" },
            customer: { email: "test@example.com" },
          }),
        });

        expect(result.renderedSubject).toBe("Order 789");
        expect(result.renderedEmailBody).toContain("Order 789");
        expect(result.renderedEmailBody).toContain("test@example.com");
      });

      it("should render with empty payload when no variables needed", async () => {
        const caller = createCaller();

        const simpleTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Static text</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

        const result = await caller.renderTemplate({
          subject: "Static subject",
          template: simpleTemplate,
          payload: JSON.stringify({}),
        });

        expect(result.renderedSubject).toBe("Static subject");
        expect(result.renderedEmailBody).toContain("Static text");
      });
    });

    describe("error handling", () => {
      it("should throw BAD_REQUEST for invalid JSON payload", async () => {
        const caller = createCaller();

        await expect(
          caller.renderTemplate({
            subject: "Test",
            template: validMjmlTemplate,
            payload: "{invalid json",
          }),
        ).rejects.toThrow(TRPCError);

        await expect(
          caller.renderTemplate({
            subject: "Test",
            template: validMjmlTemplate,
            payload: "{invalid json",
          }),
        ).rejects.toThrow("Invalid payload JSON");
      });

      it("should throw BAD_REQUEST with errorContext for invalid Handlebars in subject", async () => {
        const caller = createCaller();

        try {
          await caller.renderTemplate({
            subject: "Invalid {{#if}}",
            template: validMjmlTemplate,
            payload: JSON.stringify({}),
          });
          throw new Error("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(TRPCError);
          expect((error as TRPCError).code).toBe("BAD_REQUEST");
          expect((error as TRPCError).cause).toBeDefined();
          // Verify errorContext is available through the cause
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const cause = (error as TRPCError).cause as any;

          expect(cause.errorContext).toBe("SUBJECT");
        }
      });

      it("should throw BAD_REQUEST with errorContext for invalid Handlebars in template", async () => {
        const caller = createCaller();

        const invalidHandlebarsTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>{{#if}}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

        try {
          await caller.renderTemplate({
            subject: "Valid subject",
            template: invalidHandlebarsTemplate,
            payload: JSON.stringify({}),
          });
          throw new Error("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(TRPCError);
          expect((error as TRPCError).code).toBe("BAD_REQUEST");
          expect((error as TRPCError).cause).toBeDefined();
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const cause = (error as TRPCError).cause as any;

          expect(cause.errorContext).toBe("BODY_TEMPLATE");
        }
      });

      it("should throw BAD_REQUEST with errorContext for invalid MJML", async () => {
        const caller = createCaller();

        const invalidMjmlTemplate = `<mjml>
  <mj-body>
    <mj-invalid-tag>Test</mj-invalid-tag>
  </mj-body>
</mjml>`;

        try {
          await caller.renderTemplate({
            subject: "Valid subject",
            template: invalidMjmlTemplate,
            payload: JSON.stringify({}),
          });
          throw new Error("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(TRPCError);
          expect((error as TRPCError).code).toBe("BAD_REQUEST");
          expect((error as TRPCError).cause).toBeDefined();
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const cause = (error as TRPCError).cause as any;

          expect(cause.errorContext).toBe("BODY_MJML");
        }
      });

      it("should throw BAD_REQUEST for empty subject", async () => {
        const caller = createCaller();

        await expect(
          caller.renderTemplate({
            subject: "",
            template: validMjmlTemplate,
            payload: JSON.stringify({}),
          }),
        ).rejects.toThrow(TRPCError);

        await expect(
          caller.renderTemplate({
            subject: "",
            template: validMjmlTemplate,
            payload: JSON.stringify({}),
          }),
        ).rejects.toThrow("Email subject is empty");
      });

      it("should properly propagate error message from validation", async () => {
        const caller = createCaller();

        try {
          await caller.renderTemplate({
            subject: "Invalid {{#if}}",
            template: validMjmlTemplate,
            payload: JSON.stringify({}),
          });
          throw new Error("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(TRPCError);
          const trpcError = error as TRPCError;

          // Error message should contain details about the Handlebars error
          expect(trpcError.message).toBeTruthy();
          expect(trpcError.message.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("throwTrpcErrorFromConfigurationServiceError", () => {
    const getThrownError = (error: unknown) => {
      try {
        throwTrpcErrorFromConfigurationServiceError(error);
      } catch (e) {
        return e as TRPCError;
      }

      throw new Error("Expected function to throw");
    };

    it("should map TemplateValidationError to BAD_REQUEST (not INTERNAL_SERVER_ERROR)", () => {
      const error = new SmtpConfigurationService.TemplateValidationError(
        "expected the first argument to be a number",
        { props: { errorContext: "BODY_TEMPLATE" } },
      );

      const thrown = getThrownError(error);

      expect(thrown).toBeInstanceOf(TRPCError);
      expect(thrown.code).toBe("BAD_REQUEST");
      expect(thrown.message).toBe("expected the first argument to be a number");
    });

    it("should map ConfigNotFoundError to NOT_FOUND", () => {
      const error = new SmtpConfigurationService.ConfigNotFoundError("Configuration not found");

      const thrown = getThrownError(error);

      expect(thrown.code).toBe("NOT_FOUND");
    });

    it("should map EventConfigNotFoundError to NOT_FOUND", () => {
      const error = new SmtpConfigurationService.EventConfigNotFoundError(
        "Event configuration not found",
      );

      const thrown = getThrownError(error);

      expect(thrown.code).toBe("NOT_FOUND");
    });

    it("should map CantFetchConfigError to INTERNAL_SERVER_ERROR", () => {
      const error = new SmtpConfigurationService.CantFetchConfigError("Can't fetch configuration");

      const thrown = getThrownError(error);

      expect(thrown.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should map WrongSaleorVersionError to INTERNAL_SERVER_ERROR", () => {
      const error = new SmtpConfigurationService.WrongSaleorVersionError("Wrong Saleor version");

      const thrown = getThrownError(error);

      expect(thrown.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should map unknown errors to INTERNAL_SERVER_ERROR", () => {
      const thrown = getThrownError(new Error("Some unexpected error"));

      expect(thrown.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  /*
   * Placeholder for future test suites for other procedures
   * Uncomment and implement as needed:
   *
   * describe("fetch", () => {
   *   it("should fetch all configurations", async () => {
   *     // TODO: Implement
   *   });
   * });
   *
   * describe("getConfiguration", () => {
   *   it("should get configuration by ID", async () => {
   *     // TODO: Implement
   *   });
   * });
   *
   * describe("createConfiguration", () => {
   *   it("should create new configuration", async () => {
   *     // TODO: Implement
   *   });
   * });
   *
   * describe("updateBasicInformation", () => {
   *   it("should update basic information", async () => {
   *     // TODO: Implement
   *   });
   * });
   *
   * describe("updateSmtp", () => {
   *   it("should update SMTP settings", async () => {
   *     // TODO: Implement
   *   });
   * });
   *
   * describe("updateEvent", () => {
   *   it("should update event configuration", async () => {
   *     // TODO: Implement
   *   });
   * });
   */
});
