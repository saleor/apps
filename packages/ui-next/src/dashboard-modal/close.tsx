import { Modal } from "@saleor/macaw-ui";
import { X } from "lucide-react";

import { IconButton } from "../icon-button/icon-button";
import { iconSize, iconStrokeWidth } from "../icons/icon-size";

const CLOSE_LABEL = "Close";

export const Close = (): JSX.Element => (
  <Modal.Close>
    <IconButton
      data-test-id="close-button"
      aria-label={CLOSE_LABEL}
      title={CLOSE_LABEL}
      icon={<X size={iconSize.small} strokeWidth={iconStrokeWidth} aria-hidden />}
    />
  </Modal.Close>
);
