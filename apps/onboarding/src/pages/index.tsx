import { type NextPage } from "next";

import { OnboardingProvider } from "@/modules/onboarding/onboarding-context/onboarding-context";
import { WelcomePageOnboarding } from "@/modules/onboarding/welcome-page-onboarding";

const IndexPage: NextPage = () => {
  return (
    <OnboardingProvider>
      <WelcomePageOnboarding />
    </OnboardingProvider>
  );
};

export default IndexPage;
