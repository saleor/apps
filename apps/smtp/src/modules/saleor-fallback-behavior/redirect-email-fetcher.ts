import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "../../errors";

export const RedirectEmailFetchError = BaseError.subclass("RedirectEmailFetchError");

const redirectEmailResponseSchema = z.object({
  organization: z.object({
    owner_email: z.string().email(),
  }),
});

export const fetchRedirectEmail = async (
  endpointUrl: string,
  token: string,
): Promise<Result<string, InstanceType<typeof RedirectEmailFetchError>>> => {
  let response: Response;

  try {
    response = await fetch(endpointUrl, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
  } catch (error) {
    return err(
      new RedirectEmailFetchError("Network error while fetching redirect email", {
        cause: error,
      }),
    );
  }

  if (!response.ok) {
    return err(
      new RedirectEmailFetchError(
        `Redirect email endpoint returned non-OK status: ${response.status}`,
      ),
    );
  }

  let json: unknown;

  try {
    json = await response.json();
  } catch (error) {
    return err(
      new RedirectEmailFetchError("Failed to parse redirect email endpoint response as JSON", {
        cause: error,
      }),
    );
  }

  const parsed = redirectEmailResponseSchema.safeParse(json);

  if (!parsed.success) {
    return err(
      new RedirectEmailFetchError(
        "Redirect email endpoint response does not match expected schema",
        { cause: parsed.error },
      ),
    );
  }

  return ok(parsed.data.organization.owner_email);
};
