import { Box, Button } from "@saleor/macaw-ui/next";
import clsx from "clsx";
import React from "react";

interface SideMenuProps {
  title: string;
  noItemsText?: string;
  items: { id: string; label: string }[];
  selectedItemId?: string;
  headerToolbar?: React.ReactNode;
  onDelete?: (itemId: string) => void;
  onClick: (itemId: string) => void;
}

// todo ui
export const SideMenu: React.FC<SideMenuProps> = ({
  title,
  items,
  headerToolbar,
  selectedItemId,
  noItemsText,
  onDelete,
  onClick,
}) => {
  const isNoItems = !items || !items.length;

  return (
    <Box>
      <Box title={title} />
      {isNoItems ? (
        !!noItemsText && <Box>{noItemsText}</Box>
      ) : (
        <Box>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <Box onClick={() => onClick(item.id)}>
                <Box>
                  <div>
                    {item.label}
                    {!!onDelete && (
                      <Button
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          onDelete(item.id);
                        }}
                      >
                        del
                      </Button>
                    )}
                  </div>
                </Box>
              </Box>
            </React.Fragment>
          )) ?? null}
        </Box>
      )}
    </Box>
  );
};
