import Editor from "@monaco-editor/react";
import { useTheme } from "@saleor/macaw-ui";
import { useCallback, useRef } from "react";

type Props = {
  onChange(value: string): void;
  initialTemplate: string;
  value: string;
  language: string;
  height?: string;
};

export const CodeEditor = ({
  initialTemplate,
  onChange,
  value,
  language,
  height = "600px",
}: Props) => {
  const { theme } = useTheme();
  const editorRef = useRef(null);

  // @ts-expect-error Monaco types are complex, using any for editor instance
  function handleEditorDidMount(editor, _monaco) {
    editorRef.current = editor;
  }

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
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          useShadows: false,
        },
      }}
    />
  );
};
