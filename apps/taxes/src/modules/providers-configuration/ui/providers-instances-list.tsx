import {
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListHeader,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import { useInstanceId } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { AppPaper } from "../../ui/app-paper";
import { ProviderIcon } from "./provider-icon";

const useStyles = makeStyles((theme) => {
  return {
    headerItem: {
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr",
    },
    listItem: {
      cursor: "pointer",
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr",
    },
    listItemActive: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    cell: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },
  };
});

export const TaxProvidersInstancesList = () => {
  const styles = useStyles();
  const { instanceId, setInstanceId } = useInstanceId();
  const { data: providersConfigurationData } = trpcClient.providersConfiguration.getAll.useQuery();
  const instances = providersConfigurationData ?? [];

  return (
    <AppPaper>
      <OffsettedList gridTemplate={["1fr", "1fr"]}>
        <OffsettedListHeader>
          <OffsettedListItem className={styles.headerItem}>
            <OffsettedListItemCell>Tax provider list</OffsettedListItemCell>
          </OffsettedListItem>
        </OffsettedListHeader>
        <OffsettedListBody>
          {instances.map((instance) => (
            <OffsettedListItem
              onClick={() => setInstanceId(instance.id)}
              className={clsx(styles.listItem, instance.id === instanceId && styles.listItemActive)}
              key={instance.id}
            >
              <OffsettedListItemCell className={styles.cell}>
                {instance.config.name}
                <ProviderIcon size="medium" provider={instance.provider} />
              </OffsettedListItemCell>
            </OffsettedListItem>
          ))}
        </OffsettedListBody>
      </OffsettedList>
    </AppPaper>
  );
};
