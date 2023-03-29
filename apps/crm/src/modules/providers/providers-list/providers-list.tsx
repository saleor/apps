import { ProvidersTypes, ProviderType } from "../providers-types";
import MailchimpLogo from "../../../assets/mailchimp.svg";
import SegmentLogo from "../../../assets/semgent.png";
import { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./providers-list.module.css";
import { Text, Box } from "@saleor/macaw-ui/next";

type Props = {
  onProviderClick(provider: ProviderType): void;
  activeProvider?: ProviderType;
} & HTMLAttributes<HTMLUListElement>;

export const ProvidersList = ({ className, onProviderClick, activeProvider, ...props }: Props) => {
  return (
    <ul className={clsx(className, styles.list)}>
      <li
        className={clsx(styles.item, {
          [styles.activeItem]: activeProvider === "Mailchimp",
        })}
        onClick={() => {
          onProviderClick("Mailchimp");
        }}
      >
        <img className={styles.logo} src={MailchimpLogo.src} />
        <Text>{ProvidersTypes.Mailchimp}</Text>
      </li>
      <li className={clsx(styles.item, styles.disabled)}>
        <img className={styles.logo} src={SegmentLogo.src} />
        <Box>
          <Text as="p" variant="caption" color="textNeutralDisabled">
            Coming soon
          </Text>
          <Text color="textNeutralDisabled">Segment.io</Text>
        </Box>
      </li>
    </ul>
  );
};
