import { MenuItem, Select } from "@material-ui/core";

interface TemplateSelectionFieldProps {
  templateChoices?: { label: string; value: string }[];
  value?: string;
  onChange: (value: unknown) => void;
}

export const TemplateSelectionField = ({
  value,
  onChange,
  templateChoices,
}: TemplateSelectionFieldProps) => {
  return (
    <Select
      variant="outlined"
      value={value}
      onChange={(event, val) => onChange(event.target.value)}
    >
      {!templateChoices?.length ? (
        <MenuItem value="">No templates available</MenuItem>
      ) : (
        templateChoices.map((choice) => (
          <MenuItem key={choice.value} value={choice.value}>
            {choice.label}
          </MenuItem>
        ))
      )}
    </Select>
  );
};
