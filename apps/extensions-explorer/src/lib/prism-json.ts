/* eslint-disable simple-import-sort/imports -- prism-json reads the global `Prism` that the core import below sets up, so it must come second. */
import Prism from "prismjs";
import "prismjs/components/prism-json";

export const highlightJson = (code: string) => Prism.highlight(code, Prism.languages.json, "json");
