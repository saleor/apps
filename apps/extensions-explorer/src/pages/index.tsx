import {
  Box,
  Button,
  Checkbox,
  Chip,
  Input,
  Modal,
  Multiselect,
  Select,
  Text,
} from "@saleor/macaw-ui";
import { PencilIcon } from "lucide-react";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";

import { decodeConfig, encodeConfig } from "@/extensions/codec";
import {
  ALL_MOUNTS,
  appendExtensions,
  defaultIdentifier,
  type ExtensionConfig,
  identifierOf,
  type Mount,
  normalize,
  optionFields,
  targetsForMount,
  toManifestExtension,
  validate,
  VIEWS,
} from "@/extensions/domain";
import { DEFAULT_EXTENSIONS, PRESETS } from "@/extensions/presets";
import { highlightJson } from "@/lib/prism-json";

const MOUNT_OPTIONS = ALL_MOUNTS.map((mount) => ({ value: mount, label: mount }));
const VIEW_OPTIONS = VIEWS.map((view) => ({ value: view, label: view }));
const METHOD_OPTIONS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
];

/**
 * Hand-edit the manifest entry a row produces. Anything that parses as JSON is
 * accepted - the playground exists to try shapes the form doesn't model yet.
 */
const JsonModal = ({
  extension,
  onClose,
  onSave,
}: {
  extension: ExtensionConfig;
  onClose: () => void;
  onSave: (raw: ExtensionConfig["raw"]) => void;
}) => {
  const [source, setSource] = useState(() =>
    JSON.stringify(
      extension.raw ?? toManifestExtension(extension, window.location.origin),
      null,
      2,
    ),
  );

  let parsed: unknown = null;
  let error: string | null = null;

  try {
    parsed = JSON.parse(source);
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <Modal open onChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Box
          position="fixed"
          top={0}
          left={0}
          __width="min(800px, 90vw)"
          __top="50%"
          __left="50%"
          __transform="translate(-50%, -50%)"
          backgroundColor="default1"
          borderRadius={4}
          boxShadow="defaultModal"
          padding={6}
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <Text size={6} as="h2">
            Manifest entry JSON
          </Text>

          <Box
            borderStyle="solid"
            borderWidth={1}
            borderColor={error ? "critical1" : "default1"}
            borderRadius={3}
            overflow="auto"
            __maxHeight="60vh"
            __backgroundColor="#2d2d2d"
          >
            <Editor
              value={source}
              onValueChange={setSource}
              highlight={highlightJson}
              padding={12}
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: "#ccc",
                minHeight: "300px",
              }}
            />
          </Box>

          <Text size={2} color={error ? "critical1" : "default2"}>
            {error ?? "Saved verbatim - unknown mounts, targets and options are all allowed."}
          </Text>

          <Box display="flex" gap={3} justifyContent="flex-end">
            {extension.raw && (
              <Button
                variant="tertiary"
                onClick={() => {
                  onSave(undefined);
                  onClose();
                }}
              >
                Reset to form
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!!error}
              onClick={() => {
                onSave(parsed as ExtensionConfig["raw"]);
                onClose();
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </Modal>
  );
};

const ExtensionRow = ({
  extension,
  duplicate,
  onChange,
  onRemove,
}: {
  extension: ExtensionConfig;
  duplicate: boolean;
  onChange: (next: ExtensionConfig) => void;
  onRemove: () => void;
}) => {
  const fields = optionFields(extension.mount, extension.target);
  const error =
    validate(extension) ?? (duplicate ? "Identifier must be unique within the app" : null);
  const patch = (next: Partial<ExtensionConfig>) => onChange(normalize({ ...extension, ...next }));
  const [editingJson, setEditingJson] = useState(false);

  const actions = (
    <>
      <Button
        variant="tertiary"
        size="small"
        icon={<PencilIcon size={16} />}
        title="Edit raw JSON"
        onClick={() => setEditingJson(true)}
      />
      <Button variant="tertiary" size="small" onClick={onRemove}>
        Remove
      </Button>
      {editingJson && (
        <JsonModal
          extension={extension}
          onClose={() => setEditingJson(false)}
          onSave={(raw) => onChange({ ...extension, raw })}
        />
      )}
    </>
  );

  if (extension.raw) {
    return (
      <Box
        borderBottomStyle="solid"
        borderBottomWidth={1}
        borderColor="default1"
        paddingY={3}
        display="flex"
        gap={3}
        alignItems="center"
      >
        <Chip>Custom JSON</Chip>
        <Text size={2} color="default2" __flexGrow="1" __overflow="hidden" whiteSpace="nowrap">
          {JSON.stringify(extension.raw)}
        </Text>
        {actions}
      </Box>
    );
  }

  return (
    <Box borderBottomStyle="solid" borderBottomWidth={1} borderColor="default1" paddingY={3}>
      <Box display="flex" gap={3} alignItems="flex-end" flexWrap="wrap">
        <Box __width="280px">
          <Select
            size="small"
            label="Mount"
            options={MOUNT_OPTIONS}
            value={extension.mount}
            onChange={(value) => patch({ mount: value as Mount })}
          />
        </Box>

        <Box __width="140px">
          <Select
            size="small"
            label="Target"
            options={targetsForMount(extension.mount).map((target) => ({
              value: target,
              label: target,
            }))}
            value={extension.target}
            onChange={(value) => patch({ target: value as ExtensionConfig["target"] })}
          />
        </Box>

        {fields.method && (
          <Box __width="110px">
            <Select
              size="small"
              label="Method"
              options={METHOD_OPTIONS}
              value={extension.method ?? "GET"}
              onChange={(value) => patch({ method: value as "GET" | "POST" })}
            />
          </Box>
        )}

        {fields.fullscreen && (
          <Box display="flex" alignItems="center" gap={2} paddingBottom={2}>
            <Checkbox
              checked={!!extension.fullscreen}
              onCheckedChange={(checked) => patch({ fullscreen: checked === true })}
            />
            <Text size={2}>Fullscreen</Text>
          </Box>
        )}

        {fields.views && (
          <Box __width="320px">
            <Multiselect
              size="small"
              label="Views (empty = all)"
              options={VIEW_OPTIONS}
              value={extension.views ?? []}
              onChange={(value) => patch({ views: value as ExtensionConfig["views"] })}
            />
          </Box>
        )}

        {fields.aliases && (
          <Box __width="220px">
            <Input
              size="small"
              label="Aliases (comma separated)"
              value={extension.aliases?.join(", ") ?? ""}
              onChange={(event) =>
                patch({ aliases: event.target.value.split(",").map((alias) => alias.trimStart()) })
              }
            />
          </Box>
        )}

        <Box __width="220px" flexGrow="1">
          <Input
            size="small"
            label="Label"
            error={!extension.label.trim()}
            value={extension.label}
            onChange={(event) => patch({ label: event.target.value })}
          />
        </Box>

        <Box __width="200px">
          <Input
            size="small"
            label="Identifier"
            error={duplicate}
            placeholder={defaultIdentifier(extension)}
            value={extension.identifier ?? ""}
            onChange={(event) => patch({ identifier: event.target.value })}
          />
        </Box>

        {actions}
      </Box>

      {error && (
        <Text size={2} color="critical1">
          {error}
        </Text>
      )}
    </Box>
  );
};

const IndexPage: NextPage = () => {
  const [initial] = useState(
    () => decodeConfig(new URLSearchParams(window.location.search).get("c") ?? undefined) ?? null,
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [extensions, setExtensions] = useState<ExtensionConfig[]>(() =>
    appendExtensions([], initial?.extensions ?? DEFAULT_EXTENSIONS),
  );
  const [copied, setCopied] = useState(false);

  const encoded = encodeConfig({ ...(name ? { name } : {}), extensions });
  const manifestUrl = `${window.location.origin}/api/manifest?c=${encoded}`;

  /** Keep the page URL in sync so a configuration can be shared or reopened. */
  useEffect(() => {
    window.history.replaceState(null, "", `/?c=${encoded}`);
  }, [encoded]);

  const update = (index: number, next: ExtensionConfig) =>
    setExtensions((current) => current.map((item, i) => (i === index ? next : item)));

  /** Every row of a colliding pair is flagged - there is no "first one wins" here. */
  const identifiers = extensions.map((extension) =>
    extension.raw ? null : identifierOf(extension),
  );
  const duplicates = new Set(
    identifiers.filter(
      (identifier, index) => identifier && identifiers.indexOf(identifier) !== index,
    ),
  );

  return (
    <Box padding={8} display="flex" flexDirection="column" gap={6}>
      <Box>
        <Text size={11} as="h1">
          Saleor Extensions Explorer
        </Text>
        <Text as="p" marginTop={2}>
          Compose a set of Dashboard extensions, copy the generated manifest URL and install it in
          Saleor. Every extension renders a placeholder that shows the context it received.
        </Text>
      </Box>

      <Box>
        <Text size={6} as="h2" marginBottom={3}>
          Presets
        </Text>
        <Box display="flex" gap={3} flexWrap="wrap">
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="secondary"
              title={preset.description}
              onClick={() =>
                setExtensions((current) => appendExtensions(current, preset.extensions))
              }
            >
              + {preset.name}
            </Button>
          ))}
        </Box>
      </Box>

      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
          <Text size={6} as="h2">
            Extensions ({extensions.length})
          </Text>
          <Box display="flex" gap={3}>
            <Button
              variant="secondary"
              onClick={() =>
                setExtensions((current) =>
                  appendExtensions(current, [
                    {
                      label: "New extension",
                      mount: "PRODUCT_DETAILS_MORE_ACTIONS",
                      target: "POPUP",
                    },
                  ]),
                )
              }
            >
              Add extension
            </Button>
            <Button variant="tertiary" onClick={() => setExtensions([])}>
              Clear all
            </Button>
          </Box>
        </Box>

        {extensions.length === 0 && (
          <Text color="default2">No extensions yet - pick a preset above.</Text>
        )}

        {extensions.map((extension, index) => (
          <ExtensionRow
            key={index}
            extension={extension}
            duplicate={duplicates.has(identifiers[index])}
            onChange={(next) => update(index, next)}
            onRemove={() => setExtensions((current) => current.filter((_, i) => i !== index))}
          />
        ))}
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <Text size={6} as="h2">
          Manifest URL
        </Text>
        <Box __width="320px">
          <Input
            label="App name suffix (optional)"
            helperText="Lets you install several configurations side by side"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Box>
        <Box display="flex" gap={3} alignItems="center">
          <Box __width="100%" flexGrow="1">
            <Input readOnly label="Manifest URL" value={manifestUrl} />
          </Box>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(manifestUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Box>

        <Box
          as="form"
          display="flex"
          alignItems="flex-end"
          gap={3}
          onSubmit={(event) => {
            event.preventDefault();

            const saleorUrl = new FormData(event.currentTarget as HTMLFormElement).get(
              "saleor-url",
            );

            window.open(
              new URL(
                `/dashboard/apps/install?manifestUrl=${encodeURIComponent(manifestUrl)}`,
                saleorUrl as string,
              ).href,
              "_blank",
            );
          }}
        >
          <Input type="url" required label="Saleor URL" name="saleor-url" />
          <Button type="submit" variant="secondary">
            Install in Saleor
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default IndexPage;
