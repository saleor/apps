import {
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListHeader,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import React from "react";
import { SingleProviderSchema } from "../../../lib/cms/config";
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
      justifyContent: "space-between",
      gap: theme.spacing(1),
    },
  };
});

export interface ProviderItemToken {
  id: string;
  name: string;
  label: string;
  value: string;
}

export interface ProviderItem {
  id: string;
  label: string;
  name: string;
  iconSrc: string;
  tokens: ProviderItemToken[];
}

interface ProviderInstancesListItemsProps {
  providerInstances: SingleProviderSchema[];
  activeProviderInstance?: SingleProviderSchema | null;
  setActiveProviderInstance: (provider: SingleProviderSchema) => void;
}

export const ProviderInstancesListItems = ({
  providerInstances,
  activeProviderInstance,
  setActiveProviderInstance,
}: ProviderInstancesListItemsProps) => {
  const styles = useStyles();

  return (
    <OffsettedList gridTemplate={["1fr", "1fr"]}>
      <OffsettedListHeader>
        <OffsettedListItem className={styles.headerItem}>
          <OffsettedListItemCell>CMS provider configuration</OffsettedListItemCell>
        </OffsettedListItem>
      </OffsettedListHeader>
      <OffsettedListBody>
        {providerInstances.map((providerInstance) => (
          <OffsettedListItem
            onClick={() => setActiveProviderInstance(providerInstance)}
            className={clsx(styles.listItem, {
              [styles.listItemActive]: activeProviderInstance?.id === providerInstance.id,
            })}
            key={providerInstance.id}
          >
            <OffsettedListItemCell className={styles.cell}>
              {providerInstance.name}
              <ProviderIcon providerName={providerInstance.providerName} />
            </OffsettedListItemCell>
          </OffsettedListItem>
        ))}
      </OffsettedListBody>
    </OffsettedList>
  );
};
