import { ComponentProps, useEffect, useState } from "react";
import { Box, Button, Text, useTheme, WarningIcon } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";
import { useDashboardNotification } from "../../lib/use-dashboard-notification";
import { useFetchAllCustomers } from "./use-fetch-all-customers";
import { Section } from "../ui/section/section";
import { MailchimpListPicker } from "../mailchimp/mailchimp-list-picker/mailchimp-list-picker";

const RootSection = ({ children, ...props }: ComponentProps<typeof Box>) => {
  return (
    <Section {...props}>
      {/* @ts-ignore todo macaw*/}
      <Text as="h1" variant="title" size="small" marginBottom={4}>
        Bulk sync
      </Text>
      {/* @ts-ignore todo macaw*/}
      <Text color="textNeutralSubdued" as="p" marginBottom={8}>
        Scan Saleor customers and send them to Mailchimp
      </Text>
      {children}
    </Section>
  );
};

export const SaleorCustomersSync = (props: ComponentProps<typeof Box>) => {
  const [enabled, setEnabled] = useState(false);
  const { customers, totalCustomersCount, done } = useFetchAllCustomers(enabled);
  const theme = useTheme().themeValues;
  const { mutateAsync, status } = trpcClient.mailchimp.audience.bulkAddContacts.useMutation();
  const { notifySuccess } = useDashboardNotification();
  const [selectedList, setSelectedList] = useState<null | string>(null);

  useEffect(() => {
    if (done) {
      mutateAsync({
        listId: selectedList!,
        contacts: customers,
      }).then(() => {
        notifySuccess("Sync successful", "Contacts sent to Mailchimp");
      });
    }
  }, [done]);

  if (!enabled) {
    return (
      <RootSection {...props}>
        <Box display="flex" marginBottom={6} gap={4}>
          <WarningIcon />
          <Text as="p">Do not leave the app while indexing</Text>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={4} alignItems="center">
          <Text variant="caption">Sync to the Mailchimp list:</Text>
          <MailchimpListPicker
            onChange={(_, value) => {
              setSelectedList(value);
            }}
          />
          {/* @ts-ignore todo macaw*/}
          <Button marginLeft={"auto"} disabled={!selectedList} onClick={() => setEnabled(true)}>
            Start
          </Button>
        </Box>
      </RootSection>
    );
  }

  if (status === "success") {
    // todo add link to the dashboard
    return (
      <RootSection {...props}>
        <Text color="textBrandDefault">Contacts synchronized, check your Mailchimp Dashboard</Text>
      </RootSection>
    );
  }

  if (status === "error") {
    return (
      <RootSection {...props}>
        <Text color="textCriticalSubdued">
          Error synchronizing contacts with Mailchimp, please try again
        </Text>
      </RootSection>
    );
  }

  return (
    <RootSection {...props}>
      {totalCustomersCount && (
        <Box display="flex" gap={4} alignItems="center" marginBottom={8}>
          <progress
            style={{
              height: 30,
            }}
            color={theme.colors.foreground.iconBrandSubdued}
            max={totalCustomersCount}
            value={customers.length}
          />
          <Text>Synchronizing total {totalCustomersCount} accounts...</Text>
        </Box>
      )}
      {done && (
        <Box>
          {/* @ts-ignore todo macaw*/}
          <Text as="p" marginBottom={4}>
            Fetched customers from Saleor
          </Text>
          {status === "loading" && <Text as="p">Sending customer to Mailchimp in progress...</Text>}
        </Box>
      )}
    </RootSection>
  );
};
