import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { SmtpUpdateChannels } from "../configuration/smtp-config-input-schema";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { UniversalChannelsSection } from "../../../lib/channel-assignment/ui/universal-channels-section";

interface ChannelsSectionProps {
  configuration: SmtpConfiguration;
}

export const ChannelsSection = ({ configuration }: ChannelsSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateChannels.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateChannels>({
        error,
        notifyError,
      });
    },
  });

  return (
    <UniversalChannelsSection
      configurationId={configuration.id}
      channelConfiguration={configuration.channels}
      mutate={mutate}
    />
  );
};
