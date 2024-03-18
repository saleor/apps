import { NextPage } from "next";
import React, { useEffect } from "react";

import { AppColumnsLayout } from "../../../modules/ui/app-columns-layout/app-columns-layout";
import { ProvidersList } from "../../../modules/providers/providers-list/providers-list";
import { useRouter } from "next/router";
import { Text } from "@saleor/macaw-ui";
import {
  isValidProviderType,
  ProvidersTypes,
  ProviderType,
} from "../../../modules/providers/providers-types";
import { MailchimpConfigView } from "../../../modules/mailchimp/views/mailchimp-config-view/mailchimp-config-view";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

const views = {
  mailchimp: MailchimpConfigView,
} satisfies Record<ProviderType, React.ComponentType>;

const ProvidersPage: NextPage = () => {
  const router = useRouter();
  const selectedProviderQuery = router.query.provider && router.query.provider[0];
  const { appBridgeState } = useAppBridge();

  useEffect(() => {
    if (!isValidProviderType(selectedProviderQuery)) {
      router.push(`/configuration/providers/${ProvidersTypes.mailchimp}`);
    }
    // todo show 404?
  }, [selectedProviderQuery, router]);

  const selectedProvider = selectedProviderQuery as ProviderType;

  const ProviderView = views[selectedProvider] ?? (() => null);

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <div>
      <p>Connect Saleor clients database with your favorite CRM platform.</p>
      <AppColumnsLayout marginTop={9}>
        <ProvidersList
          onProviderClick={(provider) => {
            router.push(`/configuration/providers/${provider}`);
          }}
          activeProvider="mailchimp"
        />
        <ProviderView />
      </AppColumnsLayout>
    </div>
  );
};

export default ProvidersPage;
