import { TextLink } from "@saleor/apps-ui";
import { AppPageHeader, DetailPageLayout, SettingsPageContent } from "@saleor/apps-ui-next";
import { type ReactNode } from "react";

import { StripeModeLegend } from "@/modules/ui/stripe-setup/stripe-mode-legend";

const DOCS_URL = "https://docs.saleor.io/developer/app-store/apps/stripe/overview";

/**
 * Static chrome of the configuration page.
 *
 * Dashboard opens the app at `/`, which only redirects to `/config` once AppBridge handshakes.
 * Both routes render this shell so the handover swaps in the section body without the header,
 * description or legend shifting around it.
 */
export const ConfigPageShell = ({ children }: { children: ReactNode }) => (
  <DetailPageLayout data-test-id="stripe-config-page">
    <AppPageHeader
      title="Configuration"
      actions={
        <TextLink href={DOCS_URL} newTab size={2}>
          Documentation
        </TextLink>
      }
    />
    <DetailPageLayout.Content>
      <SettingsPageContent
        description={
          <>
            Create Stripe configurations, then assign which Saleor channels use each one. Checkout
            uses the configuration mapped to that channel.
          </>
        }
        aside={<StripeModeLegend />}
      >
        {children}
      </SettingsPageContent>
    </DetailPageLayout.Content>
  </DetailPageLayout>
);
