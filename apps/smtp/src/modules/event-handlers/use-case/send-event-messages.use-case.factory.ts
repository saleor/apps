import { AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { FeatureFlagService } from "../../feature-flag-service/feature-flag-service";
import { SmtpConfigurationService } from "../../smtp/configuration/smtp-configuration.service";
import { SmtpMetadataManager } from "../../smtp/configuration/smtp-metadata-manager";
import { EmailCompiler } from "../../smtp/services/email-compiler";
import { HandlebarsTemplateCompiler } from "../../smtp/services/handlebars-template-compiler";
import { HtmlToTextCompiler } from "../../smtp/services/html-to-text-compiler";
import { MjmlCompiler } from "../../smtp/services/mjml-compiler";
import { SmtpEmailSender } from "../../smtp/services/smtp-email-sender";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";

export class SendEventMessagesUseCaseFactory {
  createFromAuthData(authData: AuthData): SendEventMessagesUseCase {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });

    return new SendEventMessagesUseCase({
      emailSender: new SmtpEmailSender(),
      emailCompiler: new EmailCompiler(
        new HandlebarsTemplateCompiler(),
        new HtmlToTextCompiler(),
        new MjmlCompiler(),
      ),
      configService: new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({ client }),
        metadataManager: new SmtpMetadataManager(
          createSettingsManager(client, authData.appId),
          authData.saleorApiUrl,
        ),
      }),
    });
  }
}
