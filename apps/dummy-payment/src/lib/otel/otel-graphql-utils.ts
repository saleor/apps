import { type Span } from "@opentelemetry/api";
import { GraphQLAttributeNames } from "./lib/observability-attributes";

export const addRequestHeaderAttributes = (
  span: Span,
  headers?: Record<string, string | string[]>,
) => {
  if (!headers) return;

  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase().includes("authorization")) {
      span.setAttribute(`http.request.header.${key}`, "(redacted)");

      return;
    }

    if (Array.isArray(value)) {
      span.setAttribute(`http.request.header.${key}`, value.join(", "));
    } else {
      span.setAttribute(`http.request.header.${key}`, String(value));
    }
  });
};

const addInputVariableAttribute = (span: Span, key: string, variable: any) => {
  if (Array.isArray(variable)) {
    variable.forEach((value, idx) => {
      addInputVariableAttribute(span, `${key}.${idx}`, value);
    });
  } else if (variable instanceof Object) {
    Object.entries(variable).forEach(([nestedKey, value]) => {
      addInputVariableAttribute(span, `${key}.${nestedKey}`, value);
    });
  } else {
    span.setAttribute(`${GraphQLAttributeNames.VARIABLES}${String(key)}`, variable);
  }
};

export const addInputVariableAttributes = (span: Span, variableValues: { [key: string]: any }) => {
  Object.entries(variableValues).forEach(([key, value]) => {
    addInputVariableAttribute(span, key, value);
  });
};
