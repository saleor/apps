import { captureException } from "@sentry/nextjs";
import { type NextApiResponse } from "next";

import { type createLogger } from "../../../logger";
import { SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";

type UseCaseErrors = Array<InstanceType<typeof SendEventMessagesUseCase.BaseError>>;

export function handleUseCaseErrors({
  errors,
  logger,
  res,
}: {
  errors: UseCaseErrors;
  logger: ReturnType<typeof createLogger>;
  res: NextApiResponse;
}) {
  const errorInstance = errors[0];

  if (errorInstance instanceof SendEventMessagesUseCase.ServerError) {
    logger.info("Failed to send email(s) [server error]", { error: errors });

    return res.status(400).json({ message: `Failed to send email: ${errorInstance.message}` });
  } else if (errorInstance instanceof SendEventMessagesUseCase.ClientError) {
    logger.info("Failed to send email(s) [client error]", { error: errors });

    return res.status(400).json({ message: `Failed to send email: ${errorInstance.message}` });
  } else if (errorInstance instanceof SendEventMessagesUseCase.NoOpError) {
    logger.info("Sending emails aborted [no op]", { error: errors });

    return res.status(200).json({ message: "The event has been handled [no op]" });
  }

  logger.error("Failed to send email(s) [unhandled error]", { error: errors });
  captureException(new Error("Unhandled useCase error", { cause: errors }));

  return res
    .status(500)
    .json({ message: `Failed to send email [unhandled]: ${errorInstance.message}` });
}
