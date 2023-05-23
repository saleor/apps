import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { UniversalChannelsSection } from "../../channels/ui/universal-channels-section";
import { UpdateChannelsInput } from "../../channels/channel-configuration-schema";

interface SendgridChannelsSectionProps {
  configuration: SendgridConfiguration;
}

export const SendgridChannelsSection = ({ configuration }: SendgridChannelsSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateChannels.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<UpdateChannelsInput>({ error, notifyError });
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
