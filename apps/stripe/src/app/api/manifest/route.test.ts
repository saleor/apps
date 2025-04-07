import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as ManifestGET } from "@/app/api/manifest/route";

describe("Manifest Route", () => {
  it("Resolves manifest snapshot", async () => {
    const result = await ManifestGET(new NextRequest("http://localhost:1234"));

    expect(result).toMatchInlineSnapshot();
  });
});
