import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { CalculateTaxes } from "../../../generated/graphql";
import { ChannelConfig } from "../../modules/channels-configuration/channels-config";
import { GetChannelsConfigurationService } from "../../modules/channels-configuration/get-channels-configuration.service";
import { GetProvidersConfigurationService } from "../../modules/providers-configuration/get-providers-configuration.service";
import { ProviderConfig } from "../../modules/providers-configuration/providers-config";
import { defaultTaxesResponse } from "../../modules/taxes/defaults";
import { TaxProviderError } from "../../modules/taxes/tax-provider-error";
import { createClient } from "../graphql";
import { createLogger } from "../logger";
import { WebhookContext } from "./saleor-app-sdk";
import { calculateTaxesPayloadSchema, ExpectedWebhookPayload } from "./schema";
import { ResponseTaxPayload } from "../../modules/taxes/types";

export const withTaxesWebhook =
  (
    handler: (
      payload: ExpectedWebhookPayload,
      config: {
        provider: ProviderConfig;
        channel: ChannelConfig;
      },
      response: NextApiResponse<ResponseTaxPayload>
    ) => Promise<void>
  ) =>
  async (req: NextApiRequest, res: NextApiResponse, context: WebhookContext<CalculateTaxes>) => {
    const logger = createLogger({ event: context.event });
    const { authData, payload } = context;

    logger.info("Webhook triggered. withTaxesWebhook called");
    logger.info({ payload }, "Payload received");

    if (!authData) {
      logger.error("Auth data not found");
      logger.info(defaultTaxesResponse, "Responding with the defaultTaxesResponse");
      return res.status(200).json(defaultTaxesResponse);
    }

    logger.info("Parsing payload...");

    const validation = calculateTaxesPayloadSchema.safeParse(req.body);

    if (!validation.success) {
      logger.error({ error: validation.error.message }, "Payload is invalid");
      logger.info(defaultTaxesResponse, "Responding with the defaultTaxesResponse");
      return res.status(200).json(defaultTaxesResponse);
    }

    const { data } = validation;
    logger.info({ data }, "Payload is valid.");

    try {
      const { authData } = context;
      const client = createClient(authData.saleorApiUrl, async () =>
        Promise.resolve({ token: authData.token })
      );
      const providersConfig = await new GetProvidersConfigurationService({
        saleorApiUrl: authData.saleorApiUrl,
        apiClient: client,
      }).getConfiguration();

      const channelsConfig = await new GetChannelsConfigurationService({
        saleorApiUrl: authData.saleorApiUrl,
        apiClient: client,
      }).getConfiguration();

      logger.info({ providersConfig }, "Providers configuration returned");

      const channelSlug = payload.taxBase.channel.slug;
      const channelConfig = channelsConfig[channelSlug];

      if (!channelConfig) {
        logger.error(`Channel config not found for channel ${channelSlug}`);
        logger.info(defaultTaxesResponse, "Responding with the defaultTaxesResponse");
        return res.status(200).json(defaultTaxesResponse);
      }

      const providerInstance = providersConfig.find(
        (instance) => instance.id === channelConfig.providerInstanceId
      );

      if (!providerInstance) {
        logger.error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
        logger.info(defaultTaxesResponse, "Responding with the defaultTaxesResponse");
        return res.status(200).json(defaultTaxesResponse);
      }

      return handler(data, { provider: providerInstance, channel: channelConfig }, res);
    } catch (error) {
      // todo: improve error handling; currently instanceof zod is not working
      if (error instanceof ZodError) {
        logger.error({ message: error.message }, "Zod error");
      }
      if (error instanceof TaxProviderError) {
        logger.error({ error }, "TaxProviderError");
      } else {
        logger.error({ error }, "Unknown error");
      }

      logger.info(defaultTaxesResponse, "Responding with the defaultTaxesResponse");
      return res.status(200).json(defaultTaxesResponse);
    }
  };
