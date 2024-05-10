import { z } from "zod";

/**
 * We only care about the status at the moment but we can define more fields if needed
 */
const shape = z.object({
  status: z.number(),
});

export const AlgoliaErrorParser = {
  isAuthError: (error: unknown) => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return false;
    }

    return parsed.data.status === 403 || parsed.data.status === 401;
  },
};
