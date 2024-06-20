import { type AuthData } from "@saleor/app-sdk/APL";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";
import { type SendMailArgs } from "../../smtp/services/smtp-email-sender";
import { EmailCompiler } from "../../smtp/services/email-compiler";
import { SmtpConfigurationService } from "../../smtp/configuration/smtp-configuration.service";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { FeatureFlagService } from "../../feature-flag-service/feature-flag-service";
import { SmtpMetadataManager } from "../../smtp/configuration/smtp-metadata-manager";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { HandlebarsTemplateCompiler } from "../../smtp/services/handlebars-template-compiler";
import { HtmlToTextCompiler } from "../../smtp/services/html-to-text-compiler";
import { MjmlCompiler } from "../../smtp/services/mjml-compiler";

export class SendEventMessagesUseCaseFactory {
  createFromAuthData(authData: AuthData): SendEventMessagesUseCase {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });

    return new SendEventMessagesUseCase({
      emailSender: {
        async sendEmailWithSmtp({
          smtpSettings,
          mailData,
        }: SendMailArgs): Promise<{ response: unknown }> {
          return { response: null };
        },
      },
      emailCompiler: new EmailCompiler(
        new HandlebarsTemplateCompiler(),
        new HtmlToTextCompiler(),
        new MjmlCompiler(),
      ),
      smtpConfigurationService: new SmtpConfigurationService({
        featureFlagService: new FeatureFlagService({ client }),
        metadataManager: new SmtpMetadataManager(
          createSettingsManager(client, authData.appId),
          authData.saleorApiUrl,
        ),
      }),
    });
  }
}
