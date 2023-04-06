import { makeStyles } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import clsx from "clsx";
import { ButtonBase, Typography } from "@material-ui/core";

const useStyles = makeStyles({
  tabs: {
    display: "flex",
    flexDirection: "column",
  },
  button: {
    background: "#fff",
    border: "none",
    fontSize: 14,
    height: 50,
    textAlign: "left",
    cursor: "pointer",
    borderRadius: 8,
    padding: "0 20px",

    justifyContent: "flex-start",
  },
  active: {
    border: `1px solid hsla(212, 14%, 77%, 1)`,
  },
});

const tabs = {
  home: {
    label: "Home",
  },
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

export const AppTabs = ({ activeTab }: AppTabsProps) => {
  const styles = useStyles();
  const router = useRouter();

  const handleTabChange = (value: string) => {
    router.push(value);
  };

  return (
    <div className={styles.tabs}>
      {Object.entries(tabs).map(([key, config]) => (
        <ButtonBase
          disableRipple
          className={clsx(styles.button, {
            [styles.active]: activeTab === key,
          })}
          key={key}
          onClick={() => {
            handleTabChange(key);
          }}
        >
          <Typography>{config.label}</Typography>
        </ButtonBase>
      ))}
    </div>
  );
};
