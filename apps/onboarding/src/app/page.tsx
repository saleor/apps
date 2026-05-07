import { OnboardingPageClient } from "./_page-client";

// AppBridge + urql initialise in the browser only — bypass static prerender entirely.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <OnboardingPageClient />;
}
