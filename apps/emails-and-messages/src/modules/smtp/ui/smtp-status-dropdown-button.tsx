import { useState } from "react";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { StatusDropdownButton } from "../../../components/status-dropdown-button";

interface SmtpStatusDropdownButtonProps {
  configurationId: string;
  eventType: MessageEventTypes;
  isActive: boolean;
}

export const SmtpStatusDropdownButton = ({
  configurationId,
  eventType,
  isActive,
}: SmtpStatusDropdownButtonProps) => {
  // Using local state to immediately update the status of the button, without waiting for the cache invalidation and avoid flickering.
  const [value, setValue] = useState(isActive);
  const { notifySuccess, notifyError } = useDashboardNotification();
  const trpcContext = trpcClient.useContext();

  const { mutate, isLoading } = trpcClient.smtpConfiguration.updateEventActiveStatus.useMutation({
    onSuccess: async ({ active }) => {
      setValue(active);
      notifySuccess("Status has been updated.");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError() {
      notifyError("Updating status failed.");
    },
  });

  const onStatusToggle = () => mutate({ eventType, id: configurationId, active: !value });

  return (
    <StatusDropdownButton
      isActive={value}
      isInProgress={isLoading}
      onStatusToggle={onStatusToggle}
    />
  );
};
