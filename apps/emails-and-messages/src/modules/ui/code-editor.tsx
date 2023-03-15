import React, { useCallback, useRef } from "react";

import Editor from "@monaco-editor/react";
import { useTheme } from "@saleor/macaw-ui";

type Props = {
  onChange(value: string): void;
  initialTemplate: string;
  value: string;
  language: string;
};

export const CodeEditor = ({ initialTemplate, onChange, value, language }: Props) => {
  const { themeType } = useTheme();
  const editorRef = useRef(null);

  // @ts-ignore
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const handleOnChange = useCallback(
    (value?: string) => {
      onChange(value ?? "");
    },
    [value]
  );

  return (
    <>
      <Editor
        height="600px"
        value={value}
        theme={themeType === "dark" ? "vs-dark" : "vs-light"}
        defaultLanguage={language}
        defaultValue={initialTemplate}
        onMount={handleEditorDidMount}
        onChange={handleOnChange}
      />
    </>
  );
};
