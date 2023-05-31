import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { UniversalChannelsSection } from "../../channels/ui/universal-channels-section";
import { UpdateChannelsInput } from "../../channels/channel-configuration-schema";

interface SmtpChannelsSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpChannelsSection = ({ configuration }: SmtpChannelsSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateChannels.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<UpdateChannelsInput>({
        error,
        notifyError,
      });
    },
  });

  return (
    <UniversalChannelsSection
      configurationId={configuration.id}
      channelConfiguration={configuration.channels}
      onSubmit={mutate}
    />
  );
};
