import { Card, CardContent, CardHeader, Divider } from "@material-ui/core";
("@material-ui/icons");
import { DeleteIcon, IconButton, List, ListItem, ListItemCell } from "@saleor/macaw-ui";
import clsx from "clsx";
import React from "react";

import { makeStyles } from "@saleor/macaw-ui";
import { Skeleton } from "@material-ui/lab";

export const useStyles = makeStyles((theme) => ({
  menu: {
    height: "fit-content",
  },
  clickable: {
    cursor: "pointer",
  },
  selected: {
    "&&&&::before": {
      position: "absolute",
      left: 0,
      width: "4px",
      height: "100%",
      backgroundColor: theme.palette.saleor.active[1],
    },
  },
  spaceBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableRow: {
    minHeight: "48px",
    "&::after": {
      display: "none",
    },
  },
  greyText: {
    color: theme.palette.text.hint,
  },
  link: {
    all: "inherit",
    display: "contents",
  },
}));

interface SideMenuProps {
  title: string;
  noItemsText?: string;
  items: { id: string; label: string }[];
  selectedItemId?: string;
  headerToolbar?: React.ReactNode;
  onDelete?: (itemId: string) => void;
  onClick: (itemId: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  title,
  items,
  headerToolbar,
  selectedItemId,
  noItemsText,
  onDelete,
  onClick,
}) => {
  const classes = useStyles();

  const isNoItems = !items || !items.length;
  return (
    <Card className={classes.menu}>
      <CardHeader title={title} action={headerToolbar} />
      {isNoItems ? (
        !!noItemsText && <CardContent className={classes.greyText}>{noItemsText}</CardContent>
      ) : (
        <List gridTemplate={["1fr"]}>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <Divider />
              <ListItem
                className={clsx(classes.clickable, classes.tableRow, {
                  [classes.selected]: item.id === selectedItemId,
                })}
                onClick={() => onClick(item.id)}
              >
                <ListItemCell>
                  <div className={classes.spaceBetween}>
                    {item.label}
                    {!!onDelete && (
                      <IconButton
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          onDelete(item.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </div>
                </ListItemCell>
              </ListItem>
            </React.Fragment>
          )) ?? <Skeleton />}
          <Divider />
        </List>
      )}
    </Card>
  );
};

export default SideMenu;
