import { ProviderType } from "../providers-types";
import MailchimpLogo from "../../../assets/mailchimp.svg";
import MailchimpLogoDark from "../../../assets/mailchimp-dark.png";
import SegmentLogo from "../../../assets/segment.png";
import RudderstackLogo from "../../../assets/rudderstack.png";
import { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./providers-list.module.css";
import { Box, MarketplaceIcon, Text, useTheme } from "@saleor/macaw-ui";
import { TextLink } from "@saleor/apps-ui";

type Props = {
  onProviderClick(provider: ProviderType): void;
  activeProvider?: ProviderType;
} & HTMLAttributes<HTMLUListElement>;

export const ProvidersList = ({ className, onProviderClick, activeProvider, ...props }: Props) => {
  const { theme } = useTheme();

  return (
    <ul className={clsx(className, styles.list)} data-macaw-theme={theme}>
      <li
        className={clsx(styles.item, {
          [styles.activeItem]: activeProvider === "mailchimp",
        })}
        onClick={() => {
          onProviderClick("mailchimp");
        }}
      >
        <img
          alt="Mailchimp logo"
          className={styles.logo}
          src={theme === "defaultLight" ? MailchimpLogo.src : MailchimpLogoDark.src}
        />
        <Text>Mailchimp</Text>
      </li>
      <li className={clsx(styles.item, styles.disabled)}>
        <img alt="Segment.io Logo" className={styles.logo} src={SegmentLogo.src} />
        <Box>
          <Text as="p" variant="caption" color="textNeutralDisabled">
            Coming soon
          </Text>
          <Text color="textNeutralDisabled">Segment.io</Text>
        </Box>
      </li>
      <li className={clsx(styles.item, styles.disabled)}>
        <img
          alt="Rudderstack logo"
          className={clsx(styles.logo, "darkmode-logo-invert")}
          src={RudderstackLogo.src}
        />
        <Box>
          <Text as="p" variant="caption" color="textNeutralDisabled">
            Coming soon
          </Text>
          <Text color="textNeutralDisabled">Rudderstack</Text>
        </Box>
      </li>
      <li className={styles.item}>
        <Box>
          <TextLink href="https://github.com/saleor/apps/discussions/categories/integrations-features">
            <Box display="flex" gap={1.5}>
              <MarketplaceIcon />
              <Text color="inherit">Request integration</Text>
            </Box>
          </TextLink>
        </Box>
      </li>
    </ul>
  );
};
