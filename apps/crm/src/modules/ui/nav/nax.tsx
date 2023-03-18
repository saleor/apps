import { List } from "@saleor/macaw-ui/next";
import { ComponentProps } from "react";

export const Nav = (props: Omit<ComponentProps<typeof List>, "children">) => {
  return (
    <List
      borderColor="neutralPlain"
      borderWidth={1}
      borderStyle="solid"
      borderRadius={4}
      {...props}
    >
      <List.Item paddingY={6} paddingX={4}>
        Customers to Audience
      </List.Item>
      <List.Item paddingY={6} paddingX={4}>
        Settings
      </List.Item>
    </List>
  );
};
