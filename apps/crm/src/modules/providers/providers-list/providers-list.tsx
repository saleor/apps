import { ProvidersTypes, ProviderType } from "../providers-types";
import MailchimpLogo from "../../../assets/mailchimp.svg";
import SegmentLogo from "../../../assets/semgent.png";
import RudderstackLogo from "../../../assets/rudderstack.png";
import { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./providers-list.module.css";
import { Text, Box, MarketplaceIcon, Avatar } from "@saleor/macaw-ui/next";
import { TextLink } from "../../ui/text-link/text-link";

type Props = {
  onProviderClick(provider: ProviderType): void;
  activeProvider?: ProviderType;
} & HTMLAttributes<HTMLUListElement>;

export const ProvidersList = ({ className, onProviderClick, activeProvider, ...props }: Props) => {
  return (
    <ul className={clsx(className, styles.list)}>
      <li
        className={clsx(styles.item, {
          [styles.activeItem]: activeProvider === "mailchimp",
        })}
        onClick={() => {
          onProviderClick("mailchimp");
        }}
      >
        <img alt="Mailchimp logo" className={styles.logo} src={MailchimpLogo.src} />
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
        <img alt="Rudderstack logo" className={styles.logo} src={RudderstackLogo.src} />
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
            <Box display="flex" gap={4}>
              <MarketplaceIcon />
              <Text color="inherit">Request integration</Text>
            </Box>
          </TextLink>
        </Box>
      </li>
    </ul>
  );
};
