import { sourceOptions } from "../catalog-sources";
import { type AvailableSourceId, type ImportSourceSelectValue } from "../ui-types";

export const ImportSourceSelect = ({
  selectedSourceId,
  onChange,
}: {
  selectedSourceId: AvailableSourceId | null;
  onChange: (value: ImportSourceSelectValue) => void;
}) => (
  <div className="import-source-select">
    <label className="import-source-field">
      <span>Import from</span>
      <select
        value={selectedSourceId ? `source:${selectedSourceId}` : ""}
        onChange={(event) => onChange(event.target.value as ImportSourceSelectValue)}
      >
        {!selectedSourceId ? <option value="">Choose a source</option> : null}
        {sourceOptions.map((source) => (
          <option key={source.id} value={`source:${source.id}`}>
            {source.name}
          </option>
        ))}
      </select>
    </label>
  </div>
);
