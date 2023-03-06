import {
  DeleteIcon,
  IconButton,
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import React from "react";

const useStyles = makeStyles((theme) => {
  return {
    listItem: {
      cursor: "pointer",
      height: "auto !important",
    },
    listItemActive: {
      background: "#f4f4f4",
      borderRadius: 4,
      overflow: "hidden",
    },
    channelSlug: {
      fontFamily: "monospace",
      opacity: 0.8,
    },
  };
});

type ListItem = {
  label: string;
  id: string;
};

type Props = {
  listItems: ListItem[];
  activeItemId?: string;
  onItemClick(itemId?: string): void;
};

export const ConfigurationsList = ({ listItems, activeItemId, onItemClick }: Props) => {
  const styles = useStyles();
  return (
    <OffsettedList gridTemplate={["1fr"]}>
      <OffsettedListBody>
        {listItems.map((c) => {
          return (
            <OffsettedListItem
              className={clsx(styles.listItem, {
                [styles.listItemActive]: c.id === activeItemId,
              })}
              key={c.id}
              onClick={() => {
                onItemClick(c.id);
              }}
            >
              <OffsettedListItemCell>
                {c.label}
                <IconButton
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
        <OffsettedListItem
          className={clsx(styles.listItem, {
            [styles.listItemActive]: activeItemId === undefined,
          })}
          key="new"
          onClick={() => {
            onItemClick();
          }}
        >
          <OffsettedListItemCell>Create new</OffsettedListItemCell>
        </OffsettedListItem>
      </OffsettedListBody>
    </OffsettedList>
  );
};
