import { WebApiAdapter } from "@saleor/app-sdk/handlers/fetch-api";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const adapter = new WebApiAdapter(request, Response);
  const baseUrl = adapter.getBaseUrl();

  const body = await request.text();

  const target = new URL("/test", baseUrl);

  target.searchParams.set("body", body);

  return NextResponse.redirect(target, { status: 303 });
}
