import { z } from "zod";

import { env } from "../../env";

const redirectEmailConfigSchema = z.object({
  endpointUrl: z.string().url(),
  token: z.string().min(1),
});

export type RedirectEmailConfig = z.infer<typeof redirectEmailConfigSchema>;

export const getRedirectEmailConfig = (): RedirectEmailConfig | null => {
  const parsed = redirectEmailConfigSchema.safeParse({
    endpointUrl: env.FALLBACK_EMAIL_REDIRECT_ENDPOINT,
    token: env.FALLBACK_EMAIL_REDIRECT_TOKEN,
  });

  return parsed.success ? parsed.data : null;
};
