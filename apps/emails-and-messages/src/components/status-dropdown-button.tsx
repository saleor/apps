import { Dropdown, DropdownButton, List, Text } from "@saleor/macaw-ui/next";

interface StatusDropdownButtonProps {
  isActive?: boolean;
  isInProgress?: boolean;
  onStatusToggle?: () => void;
}

export const StatusDropdownButton = ({
  isActive,
  isInProgress,
  onStatusToggle,
}: StatusDropdownButtonProps) => {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <DropdownButton
          variant="contained"
          size="small"
          __width="100px"
          backgroundColor={isActive ? "decorativeSurfaceSubdued2" : "surfaceCriticalSubdued"}
          borderColor={"neutralHighlight"}
          disabled={isInProgress}
        >
          <Text color={isActive ? "text2Decorative" : "textCriticalDefault"} variant="caption">
            {isActive ? "Active" : "Inactive"}
          </Text>
        </DropdownButton>
      </Dropdown.Trigger>
      <Dropdown.Content align="start">
        <List
          backgroundColor="surfaceNeutralPlain"
          borderRadius={3}
          boxShadow="overlay"
          borderWidth={1}
          borderColor="neutralDefault"
          borderStyle={"solid"}
          marginY={2}
        >
          <Dropdown.Item>
            <List.Item paddingY={3} paddingLeft={4} paddingRight={14} onClick={onStatusToggle}>
              <Text>{isActive ? "Deactivate" : "Activate"}</Text>
            </List.Item>
          </Dropdown.Item>
        </List>
      </Dropdown.Content>
    </Dropdown>
  );
};
