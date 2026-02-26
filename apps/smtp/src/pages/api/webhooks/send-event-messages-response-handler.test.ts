import { captureException } from "@sentry/nextjs";
import { type NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { handleUseCaseErrors } from "./send-event-messages-response-handler";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function createMockResponse() {
  const json = vi.fn();
  const res = {
    status: vi.fn().mockReturnValue({ json }),
    json,
  } as unknown as NextApiResponse;

  return { res, status: vi.mocked((res as any).status), json };
}

function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  } as unknown as ReturnType<typeof import("../../../logger").createLogger>;
}

describe("handleUseCaseErrors", () => {
  let mockRes: ReturnType<typeof createMockResponse>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRes = createMockResponse();
    mockLogger = createMockLogger();
  });

  it("Returns 400 with safe message for FailedToFetchConfigurationError", () => {
    const serverError = new SendEventMessagesUseCase.FailedToFetchConfigurationError(
      "Failed to fetch configuration",
      { props: { channelSlug: "default", event: "ORDER_CREATED" } },
    );

    handleUseCaseErrors({
      errors: [serverError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email: Failed to fetch SMTP configuration",
    });
  });

  it("Returns 400 with safe message for EmailCompilationError", () => {
    const clientError = new SendEventMessagesUseCase.EmailCompilationError(
      "Failed to compile email",
      { props: { channelSlug: "default", event: "ORDER_CREATED" } },
    );

    handleUseCaseErrors({
      errors: [clientError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email: Failed to compile email template",
    });
  });

  it("Returns 400 with safe message for InvalidSenderConfigError", () => {
    const clientError = new SendEventMessagesUseCase.InvalidSenderConfigError(
      "Missing sender name or email",
      { props: { senderName: undefined, senderEmail: undefined } },
    );

    handleUseCaseErrors({
      errors: [clientError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email: Invalid sender configuration: missing sender name or email",
    });
  });

  it("Returns 400 with safe message for generic ServerError", () => {
    const smtpError = new SendEventMessagesUseCase.ServerError("Failed to send email via SMTP");

    handleUseCaseErrors({
      errors: [smtpError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email: Failed to send email via SMTP",
    });
  });

  it("Returns 400 with safe message for generic ClientError", () => {
    const smtp554Error = new SendEventMessagesUseCase.ClientError(
      "Failed to send email via SMTP - 554",
    );

    handleUseCaseErrors({
      errors: [smtp554Error],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email: Failed to send email: message rejected by server",
    });
  });

  it("Returns 200 for NoOpError without appending error message", () => {
    const noOpError = new SendEventMessagesUseCase.EventConfigNotActiveError(
      "Event config is disabled",
      { props: { event: "ORDER_CREATED" } },
    );

    handleUseCaseErrors({
      errors: [noOpError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "The event has been handled [no op]",
    });
  });

  it("Returns 200 for FallbackNotConfiguredError (NoOp)", () => {
    const noOpError = new SendEventMessagesUseCase.FallbackNotConfiguredError(
      "No custom configuration and fallback is not enabled",
      { props: { channelSlug: "default", event: "ORDER_CREATED" } },
    );

    handleUseCaseErrors({
      errors: [noOpError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "The event has been handled [no op]",
    });
  });

  it("Returns 500 with safe message for unhandled error types", () => {
    const unhandledError = new SendEventMessagesUseCase.BaseError("Something unexpected happened");

    handleUseCaseErrors({
      errors: [unhandledError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email [unhandled]: An unexpected error occurred",
    });
  });

  it("Reports unhandled errors to Sentry", () => {
    const unhandledError = new SendEventMessagesUseCase.BaseError("Something unexpected happened");

    handleUseCaseErrors({
      errors: [unhandledError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Unhandled useCase error" }),
    );
  });

  it("Does not report ServerError to Sentry", () => {
    const serverError = new SendEventMessagesUseCase.ServerError("SMTP connection failed");

    handleUseCaseErrors({
      errors: [serverError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(captureException).not.toHaveBeenCalled();
  });

  it("Does not report ClientError to Sentry", () => {
    const clientError = new SendEventMessagesUseCase.ClientError("Invalid config");

    handleUseCaseErrors({
      errors: [clientError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(captureException).not.toHaveBeenCalled();
  });

  it("Does not report NoOpError to Sentry", () => {
    const noOpError = new SendEventMessagesUseCase.NoOpError("Event disabled");

    handleUseCaseErrors({
      errors: [noOpError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(captureException).not.toHaveBeenCalled();
  });

  it("Does not leak sensitive information from error cause", () => {
    const sensitiveHost = "internal-smtp.corp.example.com";
    const sensitivePort = "587";
    const sensitiveMessage = `ECONNREFUSED ${sensitiveHost}:${sensitivePort}`;

    const smtpError = new SendEventMessagesUseCase.ServerError("Failed to send email via SMTP", {
      cause: new Error(sensitiveMessage),
    });

    handleUseCaseErrors({
      errors: [smtpError],
      logger: mockLogger,
      res: mockRes.res,
    });

    const responseBody = mockRes.json.mock.calls[0][0];

    expect(responseBody.message).not.toContain(sensitiveHost);
    expect(responseBody.message).not.toContain(sensitivePort);
    expect(responseBody.message).not.toContain("ECONNREFUSED");
  });

  it("Uses first error from array when multiple errors present", () => {
    const firstError = new SendEventMessagesUseCase.ServerError("First SMTP host unreachable");
    const secondError = new SendEventMessagesUseCase.ServerError("Second SMTP host unreachable");

    handleUseCaseErrors({
      errors: [firstError, secondError],
      logger: mockLogger,
      res: mockRes.res,
    });

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to send email: Failed to send email via SMTP",
    });
  });
});
