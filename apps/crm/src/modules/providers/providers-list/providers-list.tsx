import { ProvidersTypes, ProviderType } from "../providers-types";
import MailchimpLogo from "../../../assets/mailchimp.svg";
import SegmentLogo from "../../../assets/semgent.png";
import { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./providers-list.module.css";

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
        <span className={styles.name}>{ProvidersTypes.Mailchimp}</span>
      </li>
      <li className={clsx(styles.item, styles.comingSoonDivider)}>Coming soon</li>
      <li className={clsx(styles.item, styles.disabled)}>
        <img className={styles.logo} src={SegmentLogo.src} />
        <span className={styles.name}>Segment.io</span>
      </li>
    </ul>
  );
};
