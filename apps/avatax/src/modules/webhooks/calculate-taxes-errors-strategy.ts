import { NextApiRequest, NextApiResponse } from "next";

/**
 * Translate internal errors to responses back to Saleor
 * Its extracted, because similar behavior is shared between CHECKOUT and ORDER operations
 *
 * TODO: Maybe we can find more elegant and less verbose way to map Modern Errors to functions?
 * Instances don't translate well with their constructors
 */
export const calculateTaxesErrorsStrategy = (req: NextApiRequest, res: NextApiResponse) => {
  return new Map([
    [
      "BrokenConfigurationError",
      () =>
        res
          .status(400)
          .send("App is not configured properly. Please verify configuration or reinstall the app"),
    ],
    [
      "MissingMetadataError",
      () => res.status(400).send("App is not configured properly. Configure the app first"),
    ],
    [
      "MissingChannelSlugError",
      () => res.status(500).send("Webhook didn't contain channel slug. This should not happen."),
    ],
    [
      "WrongChannelError",
      () =>
        res
          .status(500)
          .send(
            "Webhook was executed for channel that it was not configured with. This should not happen.",
          ),
    ],
    [
      "ProviderNotAssignedToChannelError",
      () =>
        res
          .status(400)
          .send("App is not configured properly. Please verify configuration or reinstall the app"),
    ],
  ]);
};
