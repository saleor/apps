import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { SendgridUpdateChannels } from "../configuration/sendgrid-config-input-schema";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { UniversalChannelsSection } from "../../channels/ui/universal-channels-section";

interface ChannelsSectionProps {
  configuration: SendgridConfiguration;
}

export const ChannelsSection = ({ configuration }: ChannelsSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateChannels.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SendgridUpdateChannels>({ error, notifyError });
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
