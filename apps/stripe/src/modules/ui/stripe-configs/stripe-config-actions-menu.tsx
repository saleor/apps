import { IconButton, iconSize, iconStrokeWidthBySize } from "@saleor/apps-ui-next";
import { Dropdown, List, Text } from "@saleor/macaw-ui";
import { EllipsisVertical } from "lucide-react";
import { type CSSProperties } from "react";

const disabledItemStyle: CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.5,
  pointerEvents: "none",
};

const ActionsMenuItem = ({
  disabled: itemDisabled,
  onSelect,
  children,
  color,
  "data-test-id": dataTestId,
}: {
  disabled: boolean;
  onSelect: () => void;
  children: string;
  color?: "critical1";
  "data-test-id": string;
}) => (
  <Dropdown.Item>
    <List.Item
      borderRadius={4}
      paddingX={3}
      paddingY={2}
      onClick={itemDisabled ? undefined : onSelect}
      data-test-id={dataTestId}
      disabled={itemDisabled}
      aria-disabled={itemDisabled || undefined}
      style={itemDisabled ? disabledItemStyle : undefined}
    >
      <Text color={itemDisabled ? "defaultDisabled" : color}>{children}</Text>
    </List.Item>
  </Dropdown.Item>
);

type Props = {
  configId: string;
  configName: string;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

/** Card overflow for edit and delete. Kept local so it does not collide with SMTP’s menu. */
export const StripeConfigActionsMenu = ({
  configId,
  configName,
  disabled = false,
  onEdit,
  onDelete,
}: Props) => (
  <Dropdown>
    <Dropdown.Trigger>
      <IconButton
        aria-label={`Actions for ${configName}`}
        disabled={disabled}
        data-test-id={`config-actions-${configId}`}
        icon={
          <EllipsisVertical
            size={iconSize.small}
            strokeWidth={iconStrokeWidthBySize.small}
            aria-hidden
          />
        }
      />
    </Dropdown.Trigger>
    <Dropdown.Content align="end">
      <List padding={2} borderRadius={4} boxShadow="defaultOverlay" backgroundColor="default1">
        <ActionsMenuItem
          disabled={disabled}
          onSelect={onEdit}
          data-test-id={`config-actions-edit-${configId}`}
        >
          Edit
        </ActionsMenuItem>
        <ActionsMenuItem
          disabled={disabled}
          onSelect={onDelete}
          color="critical1"
          data-test-id={`config-actions-delete-${configId}`}
        >
          Delete
        </ActionsMenuItem>
      </List>
    </Dropdown.Content>
  </Dropdown>
);
