import { NextPage } from "next";
import React, { useEffect } from "react";

import { AppColumnsLayout } from "../../../modules/ui/app-columns-layout/app-columns-layout";
import { ProvidersList } from "../../../modules/providers/providers-list/providers-list";
import { useRouter } from "next/router";
import {
  isValidProviderType,
  ProvidersTypes,
  ProviderType,
} from "../../../modules/providers/providers-types";
import { MailchimpConfigView } from "../../../modules/mailchimp/views/mailchimp-config-view/mailchimp-config-view";

const views = {
  Mailchimp: MailchimpConfigView,
} satisfies Record<ProviderType, React.ComponentType>;

/**
 * todo
 * - change providers, if there is one, add tab "mailchimp" and build entire page around it
 * - add some tabs - settings & usage
 * - add lists display https://mailchimp.com/developer/marketing/api/landing-pages-content/
 * - add sync users to lists
 */
const ProvidersPage: NextPage = () => {
  const router = useRouter();
  const selectedProviderQuery = router.query.provider && router.query.provider[0];

  useEffect(() => {
    if (!isValidProviderType(selectedProviderQuery)) {
      router.push(`/configuration/providers/${ProvidersTypes.Mailchimp}`);

      // show 404
    }
  }, [selectedProviderQuery, router]);

  const selectedProvider = selectedProviderQuery as ProviderType;

  const ProviderView = views[selectedProvider] ?? (() => null);

  return (
    <div>
      <p>Connect Saleor clients database with your favourite CRM platform.</p>
      <AppColumnsLayout marginTop={12}>
        <ProvidersList
          onProviderClick={(provider) => {
            router.push(`/configuration/providers/${provider}`);
          }}
          activeProvider="Mailchimp"
        />
        <ProviderView />
      </AppColumnsLayout>
    </div>
  );
};

export default ProvidersPage;
