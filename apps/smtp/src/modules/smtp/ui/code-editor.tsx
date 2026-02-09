import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useTheme } from "@saleor/macaw-ui";
import { useCallback, useEffect, useRef } from "react";

import { registerMjmlCompletionProviders } from "./monaco-completions";

const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false,
  },
  quickSuggestions: {
    other: true,
    strings: true,
    comments: false,
  },
  suggestOnTriggerCharacters: true,
  suggestSelection: "first" as const,
  acceptSuggestionOnEnter: "on" as const,
  snippetSuggestions: "inline" as const,
  suggest: {
    selectionMode: "always" as const,
  },
  tabCompletion: "off" as const,
} satisfies React.ComponentProps<typeof Editor>["options"];

type Props = {
  onChange(value: string): void;
  initialTemplate: string;
  value: string;
  language: string;
  height?: string;
  /**
   * When provided, registers Handlebars variable + MJML tag autocomplete
   * based on the payload's structure. Typically the parsed test-variables JSON.
   */
  templatePayload?: Record<string, unknown>;
};

export const CodeEditor = ({
  initialTemplate,
  onChange,
  value,
  language,
  height = "600px",
  templatePayload,
}: Props) => {
  const { theme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionDisposableRef = useRef<{ dispose(): void } | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (templatePayload && language === "xml") {
      completionDisposableRef.current = registerMjmlCompletionProviders(monaco, templatePayload);
    }
  };

  // Re-register completions when the payload changes (e.g. user edits test variables)
  useEffect(() => {
    if (!monacoRef.current || language !== "xml") {
      return;
    }

    completionDisposableRef.current?.dispose();

    if (templatePayload) {
      completionDisposableRef.current = registerMjmlCompletionProviders(
        monacoRef.current,
        templatePayload,
      );
    }
  }, [templatePayload, language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      completionDisposableRef.current?.dispose();
    };
  }, []);

  const handleOnChange = useCallback(
    (value?: string) => {
      onChange(value ?? "");
    },
    [onChange],
  );

  return (
    <Editor
      height={height}
      value={value}
      theme={theme === "defaultDark" ? "vs-dark" : "vs-light"}
      defaultLanguage={language}
      defaultValue={initialTemplate}
      onMount={handleEditorDidMount}
      onChange={handleOnChange}
      options={editorOptions}
    />
  );
};
