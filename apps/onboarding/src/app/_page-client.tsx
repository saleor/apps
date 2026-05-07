"use client";

import { Box } from "@saleor/macaw-ui";

import { OnboardingProvider } from "@/modules/onboarding/onboarding-context/onboarding-context";
import { WelcomePageOnboarding } from "@/modules/onboarding/welcome-page-onboarding";

import { AppProviders } from "./_providers";

export function OnboardingPageClient() {
  return (
    <AppProviders>
      <Box padding={6}>
        <OnboardingProvider>
          <WelcomePageOnboarding />
        </OnboardingProvider>
      </Box>
    </AppProviders>
  );
}
