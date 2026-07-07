import { Box, Text } from "@saleor/macaw-ui";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export const APP_ROUTES = {
  overview: "/app",
  checkout: "/app/checkout",
  transactions: "/app/transactions",
  settings: "/app/configuration",
} as const;

export type AppTabId = keyof typeof APP_ROUTES;

const TABS: { id: Exclude<AppTabId, "settings">; label: string; href: string }[] = [
  { id: "overview", label: "Overview", href: APP_ROUTES.overview },
  { id: "checkout", label: "Quick checkout", href: APP_ROUTES.checkout },
  { id: "transactions", label: "Event reporter", href: APP_ROUTES.transactions },
];

function getActiveTab(pathname: string): AppTabId {
  if (pathname.startsWith("/app/configuration")) {
    return "settings";
  }
  if (pathname.startsWith("/app/transactions")) {
    return "transactions";
  }
  if (pathname.startsWith("/app/checkout")) {
    return "checkout";
  }

  return "overview";
}

export function AppTabs() {
  const router = useRouter();
  const activeTab = getActiveTab(router.pathname);
  const settingsActive = activeTab === "settings";

  return (
    <Box
      display="flex"
      alignItems="stretch"
      justifyContent="space-between"
      borderBottomStyle="solid"
      borderBottomWidth={1}
      borderColor="default1"
      paddingX={6}
      backgroundColor="default1"
    >
      <Box display="flex" gap={0}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Link key={tab.id} href={tab.href} style={{ textDecoration: "none" }}>
              <Box
                paddingX={4}
                paddingY={3}
                cursor="pointer"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid currentColor" : "2px solid transparent",
                  transition: "border-color 150ms ease",
                }}
              >
                <Text
                  size={3}
                  fontWeight={isActive ? "bold" : "regular"}
                  color={isActive ? "default1" : "default2"}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {tab.label}
                </Text>
              </Box>
            </Link>
          );
        })}
      </Box>

      <Link href={APP_ROUTES.settings} style={{ textDecoration: "none", display: "flex" }}>
        <Box
          as="span"
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          __width="36px"
          __height="36px"
          borderRadius={3}
          borderWidth={1}
          borderStyle="solid"
          borderColor={settingsActive ? "default1" : "transparent"}
          __backgroundColor={
            settingsActive ? "var(--mu-colors-background-default1)" : "transparent"
          }
          __cursor="pointer"
          aria-label="Settings"
          aria-current={settingsActive ? "page" : undefined}
        >
          <Settings size={16} style={{ opacity: settingsActive ? 1 : 0.6 }} />
        </Box>
      </Link>
    </Box>
  );
}
