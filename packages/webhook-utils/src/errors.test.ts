import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";

import { doesErrorCodeExistsInErrors } from "./errors";

describe("doesErrorCodeExistsInErrors", () => {
  it("Finds the code in the error exception extension", () => {
    const errors = [
      new GraphQLError("Denied", { extensions: { exception: { code: "PermissionDenied" } } }),
    ];

    expect(doesErrorCodeExistsInErrors(errors, "PermissionDenied")).toBe(true);
  });

  it("Returns false for errors without an exception extension", () => {
    const errors = [new GraphQLError("Network failure")];

    expect(doesErrorCodeExistsInErrors(errors, "PermissionDenied")).toBe(false);
  });
});
