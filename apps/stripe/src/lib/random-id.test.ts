import { describe, expect, it } from "vitest";
import { z } from "zod";

import { RandomId } from "@/lib/random-id";

describe("randomId", () => {
  it("generates UUID", () => {
    const id = new RandomId().generate();

    expect(z.string().uuid().safeParse(id).success).toBe(true);
  });
});
