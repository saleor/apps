import { Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { makeStyles } from "@saleor/macaw-ui";
import { ProviderInstancePingStatus } from "./hooks/usePingProviderInstance";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  successStatus: {
    color: theme.palette.type === "dark" ? theme.palette.success.light : theme.palette.success.dark,
  },
  errorStatus: {
    color: theme.palette.error.main,
  },
}));

interface ProviderInstancePingStatusProps {
  loading: boolean;
  status: ProviderInstancePingStatus | null;
}

export const ProviderInstancePing = ({ loading, status }: ProviderInstancePingStatusProps) => {
  const styles = useStyles();

  const parseProviderInstanceStatus = () => {
    const statusText = status?.success ? "Ok" : "Error";
    const checkTime = `(check time ${status?.time})`;

    return `Configuration connection: ${statusText} ${checkTime}`;
  };

  if (loading) {
    return <Skeleton />;
  }

  return (
    <Typography
      variant="body1"
      className={clsx({
        [styles.successStatus]: status?.success,
        [styles.errorStatus]: !status?.success,
      })}
    >
      {parseProviderInstanceStatus()}
    </Typography>
  );
};
