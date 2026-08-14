"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Text } from "@saleor/macaw-ui";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  Mail,
  Package,
  RefreshCw,
  Store,
  Truck,
} from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CreateCustomAppButton } from "./components/buttons/create-custom-app-button";
import { InviteStaffButton } from "./components/buttons/invite-staff-button";
import { GraphiqlShortcutHint } from "./components/graphiql-shortcut-hint";
import { PaperLogo } from "./components/paper-logo";
import { useAppRedirect } from "./hooks/use-app-redirect";
import { useStoreReadiness } from "./hooks/use-store-readiness";
import { useOnboarding } from "./onboarding-context/onboarding-context";
import {
  type CommerceTask,
  type CommerceTaskId,
  type StoreReadiness,
  type TaskStatus,
} from "./readiness/get-store-readiness";
import {
  getGoLiveRows,
  GO_LIVE_SECTION,
  type GuidanceRow,
  PAPER_DEMO_URL,
  PAPER_PRODUCTION_CHECKLIST_URL,
  PAPER_ROWS,
  PAPER_SECTION,
} from "./readiness/go-live-copy";
import { getIframeSaleorApiUrl, writeHomeSnapshot } from "./readiness/home-snapshot";
import { getTaskCopy, getTaskHref, getTaskPermission } from "./readiness/task-copy";
import styles from "./store-readiness-checklist.module.css";
import { StoreReadinessSkeleton } from "./store-readiness-skeleton";

const DETAILS_ICONS: Record<CommerceTaskId, ReactNode> = {
  "sales-channel": <Store size={16} />,
  "first-product": <Package size={16} />,
  payments: <CreditCard size={16} />,
  "test-order": <Truck size={16} />,
};

const GUIDANCE_ICONS: Record<string, ReactNode> = {
  "customer-email": <Mail size={16} />,
  "email-templates": <FileText size={16} />,
  "paper-deploy": <Globe size={16} />,
  "paper-cache": <RefreshCw size={16} />,
  "paper-cms": <FileText size={16} />,
};

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  if (status === "completed") {
    return (
      <Box className={styles.statusIcon} aria-hidden>
        <Box className={styles.completedIcon} aria-hidden>
          <Check size={11} strokeWidth={3} />
        </Box>
      </Box>
    );
  }

  if (status === "locked") {
    return (
      <Box className={styles.statusIcon} color="default2" aria-hidden>
        <Box className={styles.lockedIcon} aria-hidden>
          <Lock size={10} strokeWidth={2.5} />
        </Box>
      </Box>
    );
  }

  // Optional guidance rows aren't todos — a bullet, not an empty checkbox.
  if (status === "optional") {
    return (
      <Box className={styles.statusIcon} aria-hidden>
        <Box className={styles.optionalIcon} aria-hidden />
      </Box>
    );
  }

  return (
    <Box
      className={styles.statusIcon}
      color={status === "active" ? "default1" : "default2"}
      aria-hidden
    >
      <Circle size={18} strokeWidth={1.75} />
    </Box>
  );
};

const CtaButton = ({
  label,
  href,
  permission,
  variant = "primary",
  testId = "store-readiness-cta",
  external = false,
}: {
  label: string;
  href: string;
  permission?: string;
  variant?: "primary" | "secondary";
  testId?: string;
  external?: boolean;
}) => {
  const { appBridgeState } = useAppBridge();
  const redirect = useAppRedirect();
  const hasPermission =
    !permission || Boolean(appBridgeState?.user?.permissions.includes(permission));

  if (!hasPermission) {
    return (
      <Button variant="secondary" disabled>
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={() => {
        if (external) {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          redirect(href);
        }
      }}
      data-test-id={testId}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {label}
        {external ? <ExternalLink size={14} aria-hidden /> : <ArrowRight size={14} aria-hidden />}
      </Box>
    </Button>
  );
};

const taskClassName = (status: TaskStatus) =>
  [
    styles.task,
    status === "active" ? styles.taskActive : "",
    status === "locked" ? styles.taskLocked : "",
    status === "completed" ? styles.taskCompleted : "",
  ]
    .filter(Boolean)
    .join(" ");

type GuidanceRowsProps = {
  rows: GuidanceRow[];
  expandedId: string | null;
  onToggleTask: (taskId: string) => void;
  /** When true, list sits under a section header (no top border). */
  afterSectionHeader?: boolean;
};

const GuidanceRows = ({
  rows,
  expandedId,
  onToggleTask,
  afterSectionHeader = false,
}: GuidanceRowsProps) => (
  <Box
    as="ul"
    className={`${styles.taskList} ${afterSectionHeader ? styles.taskListAfterSection : ""}`}
  >
    {rows.map((row) => {
      const isExpanded = expandedId === row.id;

      const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggleTask(row.id);
        }
      };

      return (
        <Box
          as="li"
          key={row.id}
          className={taskClassName("optional")}
          data-test-id={`store-readiness-task-${row.id}`}
          data-status="optional"
          data-expanded={isExpanded ? "true" : "false"}
        >
          <Box className={styles.taskHeader}>
            <Box className={styles.taskLeading}>
              <StatusIcon status="optional" />
              <button
                type="button"
                className={styles.chevronButton}
                onClick={() => onToggleTask(row.id)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                data-test-id={`store-readiness-task-expand-${row.id}`}
              >
                <Box
                  className={`${styles.chevron} ${
                    isExpanded ? styles.chevronExpanded : styles.chevronCollapsed
                  }`}
                  aria-hidden
                >
                  <ChevronDown size={14} strokeWidth={2} />
                </Box>
              </button>
            </Box>
            <Box
              className={`${styles.taskContent} ${styles.taskContentExpandable}`}
              onClick={() => onToggleTask(row.id)}
              role="button"
              tabIndex={0}
              onKeyDown={onKeyDown}
            >
              <Box className={styles.taskHeading}>
                <Text size={3} fontWeight="medium" className={styles.taskTitle}>
                  {row.title}
                </Text>
              </Box>
              <Text size={2} color="default2">
                {row.description}
              </Text>
            </Box>
            {isExpanded && row.cta && row.ctaLabel ? (
              <Box
                className={styles.taskAction}
                onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
              >
                <CtaButton
                  label={row.ctaLabel}
                  href={row.cta.href}
                  permission={row.cta.kind === "dashboard" ? row.cta.permission : undefined}
                  variant="secondary"
                  testId="store-readiness-guidance-cta"
                  external={row.cta.kind === "external"}
                />
              </Box>
            ) : null}
          </Box>
          {isExpanded ? (
            <Box
              className={styles.taskDetails}
              data-test-id={`store-readiness-task-details-${row.id}`}
            >
              <Box className={styles.taskDetailsBody}>
                <Box className={styles.taskDetailsIcon} aria-hidden>
                  {GUIDANCE_ICONS[row.id] ?? <FileText size={16} />}
                </Box>
                <Text size={2} color="default2">
                  {row.details}
                </Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      );
    })}
  </Box>
);

type ChecklistBodyProps = {
  readiness: StoreReadiness;
  tasks: CommerceTask[];
  progress: { done: number; total: number };
  activeTaskId: CommerceTaskId | null;
  expandedId: string | null;
  builderExpanded: boolean;
  onToggleTask: (taskId: string) => void;
  onToggleBuilder: () => void;
};

/** Presentational checklist — kept separate so states are easy to exercise in tests. */
export const StoreReadinessChecklistBody = ({
  readiness,
  tasks,
  progress,
  activeTaskId,
  expandedId,
  builderExpanded,
  onToggleTask,
  onToggleBuilder,
}: ChecklistBodyProps) => {
  const requiredDone = progress.done >= progress.total;
  const nextUpTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );
  const nextUpCopy = nextUpTask ? getTaskCopy(nextUpTask.id, readiness) : null;
  const goLiveRows = useMemo(() => getGoLiveRows(readiness.smtpAppId), [readiness.smtpAppId]);

  return (
    <div className={styles.layout} data-test-id="store-readiness-checklist" aria-live="polite">
      <div className={`${styles.card} ${styles.elevated}`} data-test-id="store-readiness-main">
        <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <Text size={6} fontWeight="bold" as="h2">
              {requiredDone ? "You’re ready to sell" : "Get ready to sell"}
            </Text>
            <span className={styles.badge}>{requiredDone ? "Ready" : "Setup"}</span>
            <Text
              size={2}
              color="default2"
              className={styles.progressCount}
              data-test-id="store-readiness-progress"
              aria-label={`${progress.done} of ${progress.total}`}
            >
              {progress.done} of {progress.total}
            </Text>
          </Box>
          <Text size={3} color="default2">
            {requiredDone
              ? "Your sales channel can take orders. Optional: place a test order to confirm."
              : "Finish these steps so customers can check out."}
          </Text>
        </Box>

        <Box className={styles.sectionHeader} data-test-id="store-readiness-tasks-section">
          <Text as="h3" className={styles.sectionTitle}>
            Required to sell
          </Text>
        </Box>

        <Box as="ul" className={`${styles.taskList} ${styles.taskListAfterSection}`}>
          {tasks.map((task) => {
            const copy = getTaskCopy(task.id, readiness);
            const isExpanded = expandedId === task.id;
            // One primary CTA on the active step (optional test-order when it's next up).
            const showCta =
              task.status === "active" || (task.status === "optional" && task.id === activeTaskId);

            const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggleTask(task.id);
              }
            };

            return (
              <Box
                as="li"
                key={task.id}
                className={taskClassName(task.status)}
                data-test-id={`store-readiness-task-${task.id}`}
                data-status={task.status}
                data-expanded={isExpanded ? "true" : "false"}
              >
                <Box className={styles.taskHeader}>
                  <Box className={styles.taskLeading}>
                    <StatusIcon status={task.status} />
                    <button
                      type="button"
                      className={styles.chevronButton}
                      onClick={() => onToggleTask(task.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      data-test-id={`store-readiness-task-expand-${task.id}`}
                    >
                      <Box
                        className={`${styles.chevron} ${
                          isExpanded ? styles.chevronExpanded : styles.chevronCollapsed
                        }`}
                        aria-hidden
                      >
                        <ChevronDown size={14} strokeWidth={2} />
                      </Box>
                    </button>
                  </Box>
                  <Box
                    className={`${styles.taskContent} ${styles.taskContentExpandable}`}
                    onClick={() => onToggleTask(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                  >
                    <Box className={styles.taskHeading}>
                      <Text size={3} fontWeight="medium" className={styles.taskTitle}>
                        {copy.title}
                      </Text>
                      {copy.requirement && task.status !== "completed" ? (
                        <span className={styles.requirementBadge}>{copy.requirement}</span>
                      ) : null}
                    </Box>
                    <Text size={2} color="default2">
                      {copy.description}
                    </Text>
                  </Box>
                  {showCta ? (
                    <Box
                      className={styles.taskAction}
                      onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
                    >
                      <CtaButton
                        label={copy.ctaLabel}
                        href={getTaskHref(task.id, readiness)}
                        permission={getTaskPermission(task.id)}
                      />
                    </Box>
                  ) : null}
                </Box>
                {isExpanded ? (
                  <Box
                    className={styles.taskDetails}
                    data-test-id={`store-readiness-task-details-${task.id}`}
                  >
                    <Box className={styles.taskDetailsBody}>
                      <Box className={styles.taskDetailsIcon} aria-hidden>
                        {DETAILS_ICONS[task.id]}
                      </Box>
                      <Text size={2} color="default2">
                        {copy.details}
                      </Text>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>

        <Box className={styles.sectionHeader} data-test-id="store-readiness-go-live-section">
          <Box className={styles.sectionHeaderText}>
            <Text as="h3" className={styles.sectionTitle}>
              {GO_LIVE_SECTION.title}
            </Text>
            <Text size={2} color="default2">
              {GO_LIVE_SECTION.subtitle}
            </Text>
          </Box>
        </Box>
        <GuidanceRows
          rows={goLiveRows}
          expandedId={expandedId}
          onToggleTask={onToggleTask}
          afterSectionHeader
        />

        <Box className={styles.footer}>
          <Box className={styles.footerHint}>
            {nextUpCopy && !requiredDone ? (
              <Text size={2} color="default2" data-test-id="store-readiness-next-up">
                Next up:{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  {nextUpCopy.title}
                </Text>
              </Text>
            ) : (
              <Text size={2} color="default2" data-test-id="store-readiness-next-up">
                {requiredDone ? "Required steps are complete." : null}
              </Text>
            )}
          </Box>
          <Box className={styles.footerActions}>
            <Button
              variant="tertiary"
              size="small"
              onClick={onToggleBuilder}
              data-test-id="store-readiness-builder-toggle"
            >
              {builderExpanded ? "Hide builder tools" : "Building with the API?"}
            </Button>
          </Box>
        </Box>

        {builderExpanded ? (
          <Box className={styles.builderList} data-test-id="store-readiness-builder">
            <GraphiqlShortcutHint />
            <Box className={styles.builderItem}>
              <Box className={styles.builderItemCopy}>
                <Text size={3} fontWeight="medium">
                  API token
                </Text>
                <Text as="p" size={2} color="default2">
                  Create a custom app to mint a token and register webhooks. GraphiQL uses your user
                  session — storefronts, scripts, and CI need an app token.
                </Text>
              </Box>
              <CreateCustomAppButton />
            </Box>
            <Box className={styles.builderItem}>
              <Box>
                <Text size={3} fontWeight="medium">
                  Invite staff
                </Text>
                <Text as="p" size={2} color="default2">
                  Add teammates with the right permissions.
                </Text>
              </Box>
              <InviteStaffButton />
            </Box>
          </Box>
        ) : null}
      </div>

      <aside
        className={`${styles.card} ${styles.elevated} ${styles.paperCard}`}
        data-test-id="store-readiness-paper-section"
      >
        <Box className={styles.paperBrand}>
          <PaperLogo />
          <Box>
            <Text size={5} fontWeight="bold" as="h2">
              {PAPER_SECTION.title}
            </Text>
            <Text size={2} color="default2" marginTop={1}>
              {PAPER_SECTION.subtitle}
            </Text>
          </Box>
          <a
            className={styles.paperHero}
            href={PAPER_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Paper demo storefront"
            data-test-id="store-readiness-paper-demo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static Paper promo asset */}
            <img
              src="/paper-hero.png"
              alt=""
              className={styles.paperHeroImage}
              width={1600}
              height={785}
              decoding="async"
            />
            <span className={styles.paperHeroExternal} aria-hidden>
              <ExternalLink size={14} />
            </span>
          </a>
        </Box>
        <GuidanceRows rows={PAPER_ROWS} expandedId={expandedId} onToggleTask={onToggleTask} />
        <Box className={styles.paperFooter}>
          <Button
            variant="tertiary"
            size="small"
            onClick={() =>
              window.open(PAPER_PRODUCTION_CHECKLIST_URL, "_blank", "noopener,noreferrer")
            }
            data-test-id="store-readiness-paper-checklist"
          >
            <Box display="flex" alignItems="center" gap={1}>
              Production checklist
              <ExternalLink size={14} aria-hidden />
            </Box>
          </Button>
        </Box>
      </aside>
    </div>
  );
};

export const StoreReadinessChecklist = () => {
  const { appBridgeState } = useAppBridge();
  const { loading: prefsLoading, onboardingState, setBuilderExpanded } = useOnboarding();
  const {
    readiness,
    tasks,
    progress,
    activeTaskId,
    loading: readinessLoading,
    error,
    refresh,
  } = useStoreReadiness();

  const loading = prefsLoading || readinessLoading;
  const builderExpanded = onboardingState.builderExpanded;

  useEffect(() => {
    if (!readiness.channelsKnown) return;

    writeHomeSnapshot({
      saleorApiUrl: appBridgeState?.saleorApiUrl ?? getIframeSaleorApiUrl(),
      readiness,
      prefs: onboardingState,
    });
  }, [appBridgeState?.saleorApiUrl, onboardingState, readiness]);

  // Local only — do not persist expand/collapse (metadata writes caused loading flashes).
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userPinnedExpand, setUserPinnedExpand] = useState(false);

  useEffect(() => {
    if (loading || !activeTaskId) return;

    if (!userPinnedExpand) {
      setExpandedId(activeTaskId);
    }
  }, [loading, activeTaskId, userPinnedExpand]);

  const toggleTask = (taskId: string) => {
    setUserPinnedExpand(true);
    setExpandedId((current) => (current === taskId ? null : taskId));
  };

  if (loading) {
    return <StoreReadinessSkeleton />;
  }

  if (error && !readiness.channelsKnown) {
    return (
      <div className={`${styles.card} ${styles.elevated}`} data-test-id="store-readiness-error">
        <Box className={styles.header}>
          <Text size={6} fontWeight="bold">
            Couldn’t load setup status
          </Text>
          <Text size={3} color="default2" marginTop={2}>
            Check your connection and try again.
          </Text>
          <Box marginTop={4}>
            <Button variant="secondary" onClick={() => refresh()}>
              Retry
            </Button>
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <StoreReadinessChecklistBody
      readiness={readiness}
      tasks={tasks}
      progress={progress}
      activeTaskId={activeTaskId}
      expandedId={expandedId}
      builderExpanded={builderExpanded}
      onToggleTask={toggleTask}
      onToggleBuilder={() => setBuilderExpanded(!builderExpanded)}
    />
  );
};
