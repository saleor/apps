import { Environment } from "contentful-management";
import { describe, expect, it } from "vitest";

import { getContentfulEnvironmentLabel } from "./contentful-environment-label";

describe("ContentfulEnvironmentLabel", () => {
  it("should return only name when no aliases", () => {
    // Arrange
    const env = {
      name: "test1",
      sys: {
        aliases: [],
      },
    } as unknown as Pick<Environment, "sys" | "name">;

    // Act
    const result = getContentfulEnvironmentLabel(env);

    // Assert
    expect(result).eq("test1");
  });

  it("should return mame with single alias", () => {
    // Arrange
    const env = {
      name: "test1",
      sys: {
        aliases: [
          {
            sys: {
              id: "master",
            },
          },
        ],
      },
    } as unknown as Pick<Environment, "sys" | "name">;

    // Act
    const result = getContentfulEnvironmentLabel(env);

    // Assert
    expect(result).eq("test1 (Alias: master)");
  });

  it("should return mame with multiple alias", () => {
    // Arrange
    const env = {
      name: "test1",
      sys: {
        aliases: [
          {
            sys: {
              id: "master",
            },
          },
          {
            sys: {
              id: "slave",
            },
          },
        ],
      },
    } as unknown as Pick<Environment, "sys" | "name">;

    // Act
    const result = getContentfulEnvironmentLabel(env);

    // Assert
    expect(result).eq("test1 (Aliases: master, slave)");
  });
});
