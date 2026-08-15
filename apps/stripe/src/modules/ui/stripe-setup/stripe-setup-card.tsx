import {
  SetupChecklist,
  type SetupChecklistReviewItem,
  setupChecklistStyles,
} from "@saleor/apps-ui-next";
import { Button, useTheme } from "@saleor/macaw-ui";
import { BookOpen, CreditCard } from "lucide-react";
import { useRouter } from "next/router";

import { type StripeFrontendConfigSerializedFields } from "@/modules/app-config/domain/stripe-config";

import { buildStripeSetupTasks, summarizeStripeSetupTasks } from "./stripe-setup-summary";

type Props = {
  configs: StripeFrontendConfigSerializedFields[];
  mapping: Record<string, StripeFrontendConfigSerializedFields>;
  onDismiss: () => void;
};

export const StripeSetupCard = ({ configs, mapping, onDismiss }: Props) => {
  const router = useRouter();
  const { theme } = useTheme();
  const tasks = buildStripeSetupTasks({
    configs,
    mapping,
    addConfigAction: (
      <Button
        size="small"
        onClick={() => {
          void router.push("/config/new");
        }}
      >
        Add configuration
      </Button>
    ),
  });

  const { progress, nextUp } = summarizeStripeSetupTasks(tasks);

  const reviewItems: SetupChecklistReviewItem[] = [
    {
      id: "docs",
      icon: <BookOpen size={16} />,
      title: "Read the Stripe app docs",
      description: "Configuration, webhooks, and storefront integration.",
      onClick: () => {
        window.open(
          "https://docs.saleor.io/developer/app-store/apps/stripe/overview",
          "_blank",
          "noopener,noreferrer",
        );
      },
    },
    {
      id: "stripe-dashboard",
      icon: <CreditCard size={16} />,
      title: "Open Stripe Dashboard",
      description: "Manage keys, webhooks, and payment methods.",
      onClick: () => {
        window.open("https://dashboard.stripe.com", "_blank", "noopener,noreferrer");
      },
    },
  ];

  return (
    <SetupChecklist
      className={[
        setupChecklistStyles.elevated,
        theme === "defaultDark" && setupChecklistStyles.elevatedDark,
      ]
        .filter(Boolean)
        .join(" ")}
      data-test-id="stripe-setup-card"
      title="Finish Stripe setup"
      subtitle="Connect Stripe, assign channels on a configuration card, and confirm webhooks before taking payments."
      progress={progress}
      tasksSection={{ title: "Required for payments" }}
      tasks={tasks}
      reviewSection={{
        title: "Useful links",
        items: reviewItems,
      }}
      nextUp={nextUp}
      footerActions={
        <Button variant="tertiary" size="small" onClick={onDismiss}>
          Dismiss
        </Button>
      }
    />
  );
};
