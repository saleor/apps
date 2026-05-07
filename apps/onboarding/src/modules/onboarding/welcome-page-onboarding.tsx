"use client";

import { Accordion, Box, Button, ChervonDownIcon, Text } from "@saleor/macaw-ui";

import { DashboardCard } from "./components/dashboard-card";
import { useOnboarding } from "./onboarding-context/onboarding-context";
import { WelcomePageOnboardingAccordion } from "./welcome-page-onboarding-accordion";

type TitleProps = {
  isOnboardingCompleted: boolean;
  status: { done: number; total: number };
};

export const WelcomePageOnboarding = () => {
  const {
    markAllAsCompleted,
    isOnboardingCompleted,
    toggleOnboarding,
    onboardingState,
    validCompletedStepsCount,
    visibleSteps,
  } = useOnboarding();

  const isOnboardingExpanded = onboardingState.onboardingExpanded;
  const status = { done: validCompletedStepsCount, total: visibleSteps.length };

  return (
    <DashboardCard borderRadius={3} borderColor="default1" borderWidth={1} borderStyle="solid">
      <Accordion
        value={isOnboardingExpanded ? "onboarding" : ""}
        onValueChange={(value: string) => toggleOnboarding(value === "onboarding")}
      >
        <Accordion.Item value="onboarding" data-test-id="onboarding-accordion-item">
          <DashboardCard.Header padding={6}>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="space-between"
              gap={3}
              width="100%"
              marginRight={4}
            >
              <Title isOnboardingCompleted={isOnboardingCompleted} status={status} />

              {!isOnboardingCompleted && (
                <Button
                  variant="secondary"
                  onClick={markAllAsCompleted}
                  data-test-id="mark-as-done"
                >
                  Mark all as done
                </Button>
              )}
            </Box>
            <Accordion.Trigger>
              <Button
                display="flex"
                alignItems="center"
                transition="ease"
                __transform={isOnboardingExpanded ? "rotate(180deg)" : "none"}
                backgroundColor={{ hover: "transparent", active: "transparent" }}
                variant="tertiary"
                size="small"
                data-test-id="onboarding-accordion-trigger"
              >
                <ChervonDownIcon />
              </Button>
            </Accordion.Trigger>
          </DashboardCard.Header>

          <Accordion.Content>
            <DashboardCard.Content padding={6} paddingTop={0}>
              <WelcomePageOnboardingAccordion />
            </DashboardCard.Content>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </DashboardCard>
  );
};

const Title = ({ isOnboardingCompleted, status }: TitleProps) => {
  if (isOnboardingCompleted) {
    return <Text size={7}>Onboarding completed 🎉</Text>;
  }

  return (
    <Text size={7}>
      Let&rsquo;s Get Started ({status.done}/{status.total})
    </Text>
  );
};
