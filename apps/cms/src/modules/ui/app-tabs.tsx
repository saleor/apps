import { makeStyles, PageTab, PageTabs } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

const useStyles = makeStyles({
  tabs: {
    margin: "16px 0",
  },
});

const tabs = {
  channels: {
    label: "Channels",
  },
  providers: {
    label: "Providers",
  },
};

export type AppTab = keyof typeof tabs;

interface AppTabsProps {
  activeTab: keyof typeof tabs;
}

const AppTabs = ({ activeTab }: AppTabsProps) => {
  const styles = useStyles();
  const router = useRouter();

  const handleTabChange = (value: string) => {
    router.push(value);
  };

  return (
    <div className={styles.tabs}>
      <PageTabs value={activeTab} onChange={handleTabChange}>
        {Object.entries(tabs).map(([key, config]) => (
          <PageTab key={key} value={key} label={config.label} />
        ))}
      </PageTabs>
    </div>
  );
};
export default AppTabs;
