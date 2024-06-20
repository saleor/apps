import { type AuthData } from "@saleor/app-sdk/APL";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";
import { type SendMailArgs } from "../../smtp/services/smtp-email-sender";
import { EmailCompiler } from "../../smtp/services/email-compiler";
import { SmtpConfigurationService } from "../../smtp/configuration/smtp-configuration.service";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { FeatureFlagService } from "../../feature-flag-service/feature-flag-service";
import { SmtpMetadataManager } from "../../smtp/configuration/smtp-metadata-manager";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { MjmlCompiler } from "../../smtp/services/mjml-compiler";
import { ok, Result } from "neverthrow";
import { BaseError } from "../../../errors";

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
        {
          compile(
            template: string,
            variables: unknown,
          ): Result<
            {
              template: string;
            },
            InstanceType<any>
          > {
            return ok({
              template: `<mj-section>
  <mj-column>
    <mj-table>
      <thead>
        <tr>
          <th>
            Billing address
          </th>
          <th>
            Shipping address
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            b
          </td>
          <td>
            a
          </td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>
`,
            });
          },
        },
        {
          compile(html: string): Result<string, InstanceType<typeof BaseError>> {
            return ok("<html>asdf</html>");
          },
        },
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
