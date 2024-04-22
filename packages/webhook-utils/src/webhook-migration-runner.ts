import { NodeSDK } from "@opentelemetry/sdk-node";
import { WebhookManifest } from "@saleor/app-sdk/types";
import { Client } from "urql";
import { AppPermissionDeniedError, NetworkError, UnknownConnectionError } from "./errors";
import { OBSERVABILITY_ATTRIBUTES } from "./logger-context";
import {
  AppDetails,
  getAppDetailsAndWebhooksData,
} from "./operations/get-app-details-and-webhooks-data";
import {
  SaleorInstanceDetails,
  getSaleorInstanceDetails,
} from "./operations/get-saleor-instance-details";
import { Logger, LoggerContext } from "./types";
import { WebhookUpdater } from "./webhook-updater";

export class WebhookMigrationRunner {
  private dryRun: boolean;
  private logger: Logger;
  private loggerContext: LoggerContext;
  private otelSdk: NodeSDK;

  constructor(args: {
    dryRun: boolean;
    logger: Logger;
    loggerContext: LoggerContext;
    otelSdk: NodeSDK;
  }) {
    this.dryRun = args.dryRun;
    this.logger = args.logger;
    this.loggerContext = args.loggerContext;
    this.otelSdk = args.otelSdk;

    this.setupOtel();
  }

  private setupOtel = () => {
    if (process.env.OTEL_ENABLED === "true" && process.env.OTEL_SERVICE_NAME) {
      this.otelSdk.start();
    }

    process.on("beforeExit", () => {
      this.otelSdk
        .shutdown()
        .then(() =>
          this.logger.info(`Webhook migration ${this.dryRun ? "(dry run)" : ""} complete`, {
            dryRun: this.dryRun,
          }),
        )
        .catch((error) =>
          this.logger.error(`Error during webhook migration ${this.dryRun ? "(dry run)" : ""}`, {
            error,
            dryRun: this.dryRun,
          }),
        )
        .finally(() => process.exit(0));
    });
  };

  public migrate = async ({
    getManifests,
    saleorApiUrl,
    client,
  }: {
    getManifests: ({
      appDetails,
      instanceDetails,
    }: {
      appDetails: AppDetails;
      instanceDetails: SaleorInstanceDetails;
    }) => Promise<Array<WebhookManifest>>;
    saleorApiUrl: string;
    client: Client;
  }) => {
    this.loggerContext.wrap(async () => {
      try {
        this.loggerContext.set(OBSERVABILITY_ATTRIBUTES.API_URL, saleorApiUrl);

        this.logger.debug("Getting app details and webhooks data");

        const appDetails = await getAppDetailsAndWebhooksData({ client });

        this.logger.debug("Getting Saleor instance details");

        const instanceDetails = await getSaleorInstanceDetails({ client });

        this.loggerContext.set(OBSERVABILITY_ATTRIBUTES.SALEOR_VERSION, instanceDetails.version);

        this.logger.debug("Generate list of webhook manifests");

        const newWebhookManifests = await getManifests({ appDetails, instanceDetails });

        const updater = new WebhookUpdater({
          dryRun: this.dryRun,
          logger: this.logger,
          client,
          webhookManifests: newWebhookManifests,
          existingWebhooksData: appDetails.webhooks || [],
        });

        await updater.update();

        this.logger.info(`${saleorApiUrl}: Migration finished successfully.`);
      } catch (error) {
        switch (true) {
          case error instanceof AppPermissionDeniedError:
            this.logger.warn(
              `${saleorApiUrl}: wasn't migrated due to request being denied (app probably uninstalled)`,
              {
                error,
                reason: "App probably uninstalled",
              },
            );
            break;
          case error instanceof NetworkError:
            this.logger.warn(
              `${saleorApiUrl}: wasn't migrated due to network error (Saleor not available)`,
              {
                error,
                reason: "Saleor not available",
              },
            );
            break;
          case error instanceof UnknownConnectionError:
            this.logger.error(`${saleorApiUrl}: Error while fetching data from Saleor`, { error });
            break;
          default:
            this.logger.error(`${saleorApiUrl}: Error while running migrations`, { error });
        }
      }
    });
  };
}
