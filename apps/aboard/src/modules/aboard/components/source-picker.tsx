import { Button, Text } from "@saleor/macaw-ui";

import { sourceOptions } from "../catalog-sources";
import { type SourceOption } from "../ui-types";
import { SourceLogo } from "./source-logo";

const sourceActionLabel = (source: SourceOption) =>
  source.availability === "available" ? "Start" : "Coming soon";

export const SourcePicker = ({
  actionLabel,
  description = "Use the same preview and import flow for API, URL, and file sources.",
  onSelect,
  sources = sourceOptions,
  title = "Choose a catalog source",
}: {
  actionLabel?: string;
  description?: string;
  onSelect: (sourceId: SourceOption["id"]) => void;
  sources?: SourceOption[];
  title?: string;
}) => (
  <section className="app-section source-picker-section">
    <div className="section-copy">
      <Text as="h2" size={6} fontWeight="bold">
        {title}
      </Text>
      <Text as="p" size={2} color="default2">
        {description}
      </Text>
    </div>
    <div className="section-content">
      <div className="source-grid">
        {sources.map((source) => {
          const isAvailable = source.availability === "available";

          return (
            <article
              className={isAvailable ? "source-card" : "source-card source-card-disabled"}
              key={source.id}
            >
              <SourceLogo source={source} />
              <div className="source-card-copy">
                <Text as="h3" size={5} fontWeight="bold">
                  {source.name}
                </Text>
                <Text as="p" size={2} color="default2">
                  {source.description}
                </Text>
              </div>
              <div className="source-card-actions">
                <Button
                  type="button"
                  variant={isAvailable ? "primary" : "secondary"}
                  disabled={!isAvailable}
                  onClick={() => onSelect(source.id)}
                >
                  {actionLabel ?? sourceActionLabel(source)}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
