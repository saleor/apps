import { makeStyles } from "@saleor/macaw-ui";
import {
  OffsettedList,
  OffsettedListBody,
  OffsettedListHeader,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import { ChannelFragment } from "../../../../generated/graphql";

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
    <OffsettedList gridTemplate={["1fr", "1fr"]}>
      <OffsettedListHeader>
        <OffsettedListItem className={styles.headerItem}>
          <OffsettedListItemCell>Channel name</OffsettedListItemCell>
        </OffsettedListItem>
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
              <OffsettedListItemCell>{c.name}</OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
      </OffsettedListBody>
    </OffsettedList>
  );
};
