import { z } from "zod";

const shape = z.object({
  status: z.number(),
  message: z.string(),
});

export const AlgoliaErrorParser = {
  isAuthError: (error: unknown) => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return false;
    }

    return parsed.data.status === 403 || parsed.data.status === 401;
  },
  isRecordSizeTooBigError: (error: unknown) => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return false;
    }

    return parsed.data.status === 400 && /Record.*is too big/.test(parsed.data.message);
  },
};
