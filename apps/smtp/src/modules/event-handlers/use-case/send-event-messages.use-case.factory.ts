import { type AuthData } from "@saleor/app-sdk/APL";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";
import { type SendMailArgs } from "../../smtp/services/smtp-email-sender";
import { type CompiledEmail } from "../../smtp/services/email-compiler";
import { type FilterConfigurationsArgs } from "../../smtp/configuration/smtp-configuration.service";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { ok, okAsync, Result, ResultAsync } from "neverthrow";
import { BaseError } from "../../../errors";
import { type SmtpConfiguration } from "../../smtp/configuration/smtp-config-schema";

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
      emailCompiler: {
        compile(args): Result<CompiledEmail, InstanceType<typeof BaseError>> {
          return ok({
            from: "asd",
            html: "<html>asfd</html>",
            text: "Asdf",
            subject: "sadf",
            to: "asdf@asdf.com",
          });
        },
      },
      smtpConfigurationService: {
        getConfigurations(
          filter?: FilterConfigurationsArgs,
        ): ResultAsync<SmtpConfiguration[], InstanceType<typeof BaseError>> {
          return okAsync([]);
        },
      },
    });
  }
}
