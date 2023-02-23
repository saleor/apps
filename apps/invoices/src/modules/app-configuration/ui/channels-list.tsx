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

type Props = {
  channels: ChannelFragment[];
  activeChannelSlug: string;
  onChannelClick(channelSlug: string): void;
};

export const ChannelsList = ({ channels, activeChannelSlug, onChannelClick }: Props) => {
  const styles = useStyles();

  return (
    <OffsettedList gridTemplate={["1fr"]}>
      <OffsettedListHeader>
        <Typography variant="h3" paragraph>
          Available channels
        </Typography>
      </OffsettedListHeader>
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
                <Typography variant="caption" className={styles.channelSlug}>
                  {c.slug}
                </Typography>
              </OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
      </OffsettedListBody>
    </OffsettedList>
  );
};
