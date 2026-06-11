"use client";

import { Button } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { CheckGraphQLButton } from "../components/buttons/check-graphql-button";
import { CreateProductButton } from "../components/buttons/create-product-button";
import { ExtensionsButton } from "../components/buttons/extensions-button";
import { InviteStaffButton } from "../components/buttons/invite-staff-button";
import { OrdersButton } from "../components/buttons/orders-button";
import { useOnboarding } from "../onboarding-context/onboarding-context";
import { type OnboardingStepsIDs } from "../onboarding-context/types";

export interface OnboardingStepData {
  id: OnboardingStepsIDs;
  title: string;
  description: string;
  actions: ReactNode;
  isCompleted: boolean;
}

const buildSteps = ({
  isStepCompleted,
  onStepComplete,
}: {
  isStepCompleted: (step: OnboardingStepsIDs) => boolean;
  onStepComplete: (step: OnboardingStepsIDs) => void;
}): OnboardingStepData[] => [
  {
    id: "get-started",
    title: "Welcome to Saleor!",
    description:
      "We'll guide you through the main features so you can start customizing your store. Explore products, orders, collections, customers, and discounts to get familiar with key functions and concepts.",
    isCompleted: isStepCompleted("get-started"),
    actions: !isStepCompleted("get-started") ? (
      <Button
        variant="primary"
        data-test-id="get-started-next-step-btn"
        onClick={() => onStepComplete("get-started")}
      >
        Next step
      </Button>
    ) : null,
  },
  {
    id: "create-product",
    title: "Create a new product",
    description:
      "Go to all products from where you can create a new product and view it in all product list. View the product in GraphQL",
    isCompleted: isStepCompleted("create-product"),
    actions: (
      <>
        <CreateProductButton />
        {!isStepCompleted("create-product") && (
          <Button
            variant="secondary"
            onClick={() => onStepComplete("create-product")}
            data-test-id="create-product-mark-as-done"
          >
            Mark as done
          </Button>
        )}
      </>
    ),
  },
  {
    id: "explore-orders",
    title: "Explore orders",
    description:
      "Go to all orders where you can create an fulfilment and refund and review corresponding statuses. View the order in GraphQL",
    isCompleted: isStepCompleted("explore-orders"),
    actions: (
      <>
        <OrdersButton />
        {!isStepCompleted("explore-orders") && (
          <Button
            variant="secondary"
            onClick={() => onStepComplete("explore-orders")}
            data-test-id="explore-orders-mark-as-done"
          >
            Mark as done
          </Button>
        )}
      </>
    ),
  },
  {
    id: "graphql-playground",
    title: "Check our GraphQL playground & make an API call",
    description:
      "Saleor includes a GraphQL Playground, an interactive GraphQL editor, allowing access to your Saleor instance's API through the web browser. The Playground lets you quickly familiarize yourself with the API, perform example operations, and send your first queries and mutations.",
    isCompleted: isStepCompleted("graphql-playground"),
    actions: (
      <>
        <CheckGraphQLButton />
        {!isStepCompleted("graphql-playground") && (
          <Button
            variant="secondary"
            onClick={() => onStepComplete("graphql-playground")}
            data-test-id="graphql-playground-mark-as-done"
          >
            Mark as done
          </Button>
        )}
      </>
    ),
  },
  {
    id: "view-extensions",
    title: "Discover extension capabilities",
    description:
      "Review the central hub for managing all available extensions. Here, you can easily oversee your extensions and enhance Saleor with custom solutions using webhooks and APIs.",
    isCompleted: isStepCompleted("view-extensions"),
    actions: (
      <>
        <ExtensionsButton />
        {!isStepCompleted("view-extensions") && (
          <Button
            variant="secondary"
            onClick={() => onStepComplete("view-extensions")}
            data-test-id="view-extensions-mark-as-done"
          >
            Mark as done
          </Button>
        )}
      </>
    ),
  },
  {
    id: "invite-staff",
    title: "Invite staff members",
    description:
      "Invite team members and assign permissions on Product Information Management (PIM), Order Management System (OMS), Promotions engine, Extensions (apps, plugins)",
    isCompleted: isStepCompleted("invite-staff"),
    actions: (
      <>
        <InviteStaffButton />
        {!isStepCompleted("invite-staff") && (
          <Button
            variant="secondary"
            onClick={() => onStepComplete("invite-staff")}
            data-test-id="invite-staff-mark-as-done"
          >
            Mark as done
          </Button>
        )}
      </>
    ),
  },
];

export const useOnboardingData = () => {
  const { markOnboardingStepAsCompleted, onboardingState } = useOnboarding();

  const steps = buildSteps({
    isStepCompleted: (step) => onboardingState.stepsCompleted.includes(step),
    onStepComplete: (step) => markOnboardingStepAsCompleted(step),
  });

  return { steps };
};
