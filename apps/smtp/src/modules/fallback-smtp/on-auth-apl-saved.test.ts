import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BaseError } from "../../errors";
import { type ISetFallbackConfig, saveFallbackConfigOnRegister } from "./on-auth-apl-saved";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("saveFallbackConfigOnRegister", () => {
  let mockSetFallbackConfig: ReturnType<typeof vi.fn>;
  let fallbackService: ISetFallbackConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetFallbackConfig = vi.fn();
    fallbackService = { setFallbackConfig: mockSetFallbackConfig };
  });

  it("does nothing when no additional_data is present", async () => {
    await saveFallbackConfigOnRegister({
      rawBody: {},
      fallbackService,
    });

    expect(mockSetFallbackConfig).not.toHaveBeenCalled();
  });

  it("does nothing when additional_data is not an object", async () => {
    await saveFallbackConfigOnRegister({
      rawBody: { additional_data: "string" },
      fallbackService,
    });

    expect(mockSetFallbackConfig).not.toHaveBeenCalled();
  });

  it("saves valid config with fallbackEnabled true", async () => {
    mockSetFallbackConfig.mockReturnValue(okAsync(undefined));

    await saveFallbackConfigOnRegister({
      rawBody: {
        additional_data: {
          fallbackEnabled: true,
          fallbackRedirectEmail: "redirect@example.com",
        },
      },
      fallbackService,
    });

    expect(mockSetFallbackConfig).toHaveBeenCalledWith({
      fallbackEnabled: true,
      fallbackRedirectEmail: "redirect@example.com",
    });
  });

  it("saves config with fallbackEnabled false", async () => {
    mockSetFallbackConfig.mockReturnValue(okAsync(undefined));

    await saveFallbackConfigOnRegister({
      rawBody: {
        additional_data: {
          fallbackEnabled: false,
        },
      },
      fallbackService,
    });

    expect(mockSetFallbackConfig).toHaveBeenCalledWith({
      fallbackEnabled: false,
      fallbackRedirectEmail: null,
    });
  });

  it("saves disabled config when additional_data has invalid schema", async () => {
    mockSetFallbackConfig.mockReturnValue(okAsync(undefined));

    await saveFallbackConfigOnRegister({
      rawBody: {
        additional_data: {
          fallbackEnabled: "not-a-boolean",
        },
      },
      fallbackService,
    });

    expect(mockSetFallbackConfig).toHaveBeenCalledWith({
      fallbackEnabled: false,
      fallbackRedirectEmail: null,
    });
  });

  it("saves disabled config when fallbackEnabled is missing from additional_data", async () => {
    mockSetFallbackConfig.mockReturnValue(okAsync(undefined));

    await saveFallbackConfigOnRegister({
      rawBody: {
        additional_data: {
          someOtherField: true,
        },
      },
      fallbackService,
    });

    expect(mockSetFallbackConfig).toHaveBeenCalledWith({
      fallbackEnabled: false,
      fallbackRedirectEmail: null,
    });
  });

  it("throws when DynamoDB save fails", async () => {
    mockSetFallbackConfig.mockReturnValue(
      errAsync(new BaseError("DynamoDB connection refused")),
    );

    await expect(
      saveFallbackConfigOnRegister({
        rawBody: {
          additional_data: {
            fallbackEnabled: true,
          },
        },
        fallbackService,
      }),
    ).rejects.toThrow("Failed to save fallback SMTP config to DynamoDB");
  });

  it("does not throw when DynamoDB save succeeds", async () => {
    mockSetFallbackConfig.mockReturnValue(okAsync(undefined));

    await expect(
      saveFallbackConfigOnRegister({
        rawBody: {
          additional_data: {
            fallbackEnabled: true,
          },
        },
        fallbackService,
      }),
    ).resolves.toBeUndefined();
  });
});
