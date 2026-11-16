import { Text } from "@saleor/macaw-ui";

export const PageHeader = ({
  title,
  sourceName,
  showBack,
  onBack,
}: {
  title: string;
  sourceName?: string;
  showBack: boolean;
  onBack: () => void;
}) => (
  <header className="aboard-header">
    {showBack ? (
      <button
        aria-label="Back to Product import"
        className="aboard-header-back"
        type="button"
        onClick={onBack}
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
          <path d="m10 3-5 5 5 5" />
        </svg>
        <span>Product import</span>
      </button>
    ) : null}
    {showBack && sourceName ? (
      <>
        <span className="aboard-header-separator" aria-hidden="true">
          /
        </span>
        <Text as="span" size={2} color="default2" className="aboard-header-source">
          {sourceName}
        </Text>
        <span className="aboard-header-separator" aria-hidden="true">
          /
        </span>
      </>
    ) : null}
    <Text as="h1" size={5} fontWeight="bold">
      {title}
    </Text>
  </header>
);
