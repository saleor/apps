import { Text, type TextProps } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

export interface TitleProps extends TextProps {
  children: ReactNode;
}

export const Title = ({ children, ...rest }: TitleProps): JSX.Element => (
  <Text size={6} fontWeight="bold" {...rest}>
    {children}
  </Text>
);
