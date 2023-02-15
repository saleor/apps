import {
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListHeader,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import { Typography } from "@material-ui/core";
import React from "react";
import { ChannelFragment } from "../../../../generated/graphql";

const useStyles = makeStyles((theme) => {
  return {
    listItem: {
      cursor: "pointer",
      height: "auto !important",
    },
    listItemActive: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    cellSlug: {
      fontFamily: "monospace",
      opacity: 0.8,
    },
  };
});

type Props = {
  channels: ChannelFragment[];
  activeChannelSlug: string;
  onChannelClick(channelSlug: string): void;
};

export const ChannelsList = ({ channels, activeChannelSlug, onChannelClick }: Props) => {
  const styles = useStyles();

  return (
    <OffsettedList gridTemplate={["1fr"]}>
      <OffsettedListBody>
        {channels.map((c) => {
          return (
            <OffsettedListItem
              className={clsx(styles.listItem, {
                [styles.listItemActive]: c.slug === activeChannelSlug,
              })}
              key={c.slug}
              onClick={() => {
                onChannelClick(c.slug);
              }}
            >
              <OffsettedListItemCell>
                {c.name}
                <Typography variant="caption">
                  <code>{c.slug}</code>
                </Typography>
              </OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
      </OffsettedListBody>
    </OffsettedList>
  );
};
