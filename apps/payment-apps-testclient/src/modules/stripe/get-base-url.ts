"use server";

import { env } from "@/env";

export async function getBaseUrl() {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return `http://localhost:${env.PORT}`;
}
