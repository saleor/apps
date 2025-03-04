import { context, Span, SpanKind, SpanStatusCode, Tracer } from "@opentelemetry/api";
import { ATTR_URL_FULL } from "@opentelemetry/semantic-conventions/incubating";
import { type CombinedError, makeOperation, mapExchange, Operation } from "urql";

type Definition = {
  name: {
    value: string;
  };
};

interface ExtendedFetchOptions extends RequestInit {
  headers: Record<string, string>;
}

type ExtendedOperationContext = Operation["context"] & {
  span: Span;
  fetchOptions?: ExtendedFetchOptions;
};

interface ExtendedOperation extends Operation {
  context: ExtendedOperationContext;
}

const GraphQLAttributeNames = {
  OPERATION_TYPE: "graphql.operation.type",
  OPERATION_NAME: "graphql.operation.name",
  OPERATION_BODY: "graphql.operation.body",
  OPERATION_KEY: "graphql.operation.key",
  VARIABLES: "graphql.variables.",
} as const;

export const createOtelUrqlExchange = (args: { tracer: Tracer }) => {
  return mapExchange({
    onOperation(operation: ExtendedOperation) {
      const span = args.tracer.startSpan(
        "graphql-request",
        {
          kind: SpanKind.CLIENT,
        },
        context.active(),
      );

      span.setAttribute(
        GraphQLAttributeNames.OPERATION_NAME,
        `${(operation.query.definitions[0] as Definition).name.value ?? "unknown"}`,
      );

      span.setAttribute(GraphQLAttributeNames.OPERATION_TYPE, operation.kind);

      span.setAttribute(
        GraphQLAttributeNames.OPERATION_BODY,
        operation.query.loc?.source.body ?? "unknown",
      );

      span.setAttribute(GraphQLAttributeNames.OPERATION_KEY, operation.key);

      span.setAttribute("saleorApiUrl", operation.context.url);

      span.setAttribute(ATTR_URL_FULL, operation.context.url);

      addRequestHeaderAttributes(span, operation.context.fetchOptions?.headers);
      if (operation.variables) {
        addInputVariableAttributes(span, operation.variables);
      }

      return makeOperation(operation.kind, operation, {
        ...operation.context,
        span,
      });
    },

    // @ts-expect-error - small hack, we're extending `operation` with `span`
    onResult({ error, operation }: { operation: ExtendedOperation; error?: CombinedError }) {
      const span = operation.context.span;

      if (error) {
        span.recordException(error);
      }

      span.setStatus({ code: error ? SpanStatusCode.ERROR : SpanStatusCode.OK });

      span.end();
    },
  });
};

const addRequestHeaderAttributes = (span: Span, headers?: Record<string, string | string[]>) => {
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

const addInputVariableAttributes = (span: Span, variableValues: { [key: string]: any }) => {
  Object.entries(variableValues).forEach(([key, value]) => {
    addInputVariableAttribute(span, key, value);
  });
};
