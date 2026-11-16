import { Button, Input, Text } from "@saleor/macaw-ui";
import type { RefObject } from "react";

import { formatFileSize, PRODUCT_FEED_MAX_BYTES } from "../catalog-sources";

export const FeedSourceInput = ({
  url,
  file,
  inputRef,
  onUrlChange,
  onFileChange,
}: {
  url: string;
  file: File | null;
  inputRef: RefObject<HTMLInputElement>;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
}) => (
  <div>
    <div className="feed-source-input">
      <Input
        label={file ? "Selected XML file" : "Google Merchant RSS feed URL"}
        placeholder="https://example.com/products.xml"
        value={file ? file.name : url}
        readOnly={Boolean(file)}
        onChange={(event) => onUrlChange(event.target.value)}
      />
      {file ? (
        <Button type="button" variant="tertiary" onClick={() => onUrlChange("")}>
          Use URL
        </Button>
      ) : null}
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
        {file ? "Replace file" : "Choose XML file"}
      </Button>
    </div>
    <Text as="p" size={2} color="default2" className="feed-source-hint">
      {file
        ? `${formatFileSize(file.size)} · RSS XML`
        : "Enter a URL or choose an RSS XML file, up to 10 MB."}
    </Text>
    <input
      ref={inputRef}
      className="feed-file-input"
      type="file"
      tabIndex={-1}
      aria-label="Upload RSS XML file"
      accept=".xml,.rss,application/rss+xml,application/xml,text/xml"
      onChange={(event) => {
        const selectedFile = event.target.files?.[0] ?? null;

        if (selectedFile && selectedFile.size > PRODUCT_FEED_MAX_BYTES) {
          event.target.value = "";
        }
        if (selectedFile) onFileChange(selectedFile);
      }}
    />
  </div>
);
