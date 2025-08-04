import { describe, expect, it, vi } from "vitest";

import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";

import { OrderNoteService, OrderNoteServiceErrors } from "./order-note-service";

describe("OrderNoteService", () => {
  const instance = new OrderNoteService({
    graphqlClient: mockedGraphqlClient,
  });

  it("should successfully add order note and return note ID", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        orderNoteAdd: {
          event: { id: "event-123" },
        },
      },
    }));

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      {
        "noteId": "event-123",
      }
    `);
  });

  it("should handle GraphQL errors", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        orderNoteAdd: {
          errors: [{ code: "GRAPHQL_ERROR", message: "Test error" }],
        },
      },
    }));

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.GraphqlError);
  });

  it("should handle server errors", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      error: new Error("Server error"),
    }));

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.ServerError);
  });

  it("should handle missing resolved data", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        orderNoteAdd: {
          event: null,
        },
      },
    }));
    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.UnhandledError);
  });

  it("should handle NOT_FOUND errors", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        orderNoteAdd: {
          errors: [{ code: "NOT_FOUND", message: "Order not found" }],
        },
      },
    }));

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.UnhandledError);
  });

  it("should handle REQUIRED errors", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        orderNoteAdd: {
          errors: [{ code: "REQUIRED", message: "Message is required" }],
        },
      },
    }));

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.UnhandledError);
  });

  it("should handle first error if there are more than one", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        orderNoteAdd: {
          errors: [
            { code: "GRAPHQL_ERROR", message: "First error" },
            { code: "REQUIRED", message: "Second error" },
          ],
        },
      },
    }));

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.GraphqlError);
  });

  it("should catch error if mutation logic fails and return UnhandledError", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => {
      throw new Error("Mutation logic failed");
    });

    const result = await instance.addOrderNote({
      orderId: "order-123",
      message: "Test message",
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderNoteServiceErrors.UnhandledError);
  });
});
