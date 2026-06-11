import { type Span, SpanKind, SpanStatusCode, context } from "@opentelemetry/api";
import { type CombinedError, type Operation, makeOperation, mapExchange } from "urql";
import { getOtelTracer } from "./otel-tracer";
import { GraphQLAttributeNames, ObservabilityAttributes } from "./lib/observability-attributes";
import { addInputVariableAttributes, addRequestHeaderAttributes } from "./otel-graphql-utils";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";

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

export const otelExchange = mapExchange({
  onOperation(operation: ExtendedOperation) {
    const span = getOtelTracer().startSpan(
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

    span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, operation.context.url);

    span.setAttribute(SemanticAttributes.HTTP_URL, operation.context.url);

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
