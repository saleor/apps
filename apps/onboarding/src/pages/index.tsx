import { type NextPage } from "next";

import { OnboardingProvider } from "@/modules/onboarding/onboarding-context/onboarding-context";
import { StoreReadinessChecklist } from "@/modules/onboarding/store-readiness-checklist";

const IndexPage: NextPage = () => {
  return (
    <OnboardingProvider>
      <StoreReadinessChecklist />
    </OnboardingProvider>
  );
};

export default IndexPage;
