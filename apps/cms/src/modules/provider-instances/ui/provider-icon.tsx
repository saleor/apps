import { makeStyles } from "@saleor/macaw-ui";
import { getProviderByName } from "../../providers/config";
import Image from "next/image";
import clsx from "clsx";

interface ProviderIconProps {
  providerName: string;
  small?: boolean;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(2.5),
  },
}));

export const ProviderIcon = ({ providerName, small = false }: ProviderIconProps) => {
  const styles = useStyles();

  const provider = getProviderByName(providerName);

  return provider ? (
    <Image
      src={provider.iconSrc}
      alt={`${provider.label} icon`}
      className={clsx({
        [styles.small]: small,
      })}
    />
  ) : null;
};
