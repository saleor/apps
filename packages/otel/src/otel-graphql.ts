import { Span, SpanKind, SpanStatusCode, context } from "@opentelemetry/api";
import { AttributeNames, ObservabilityAttributes } from "./lib/observability-attributes";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { addInputVariableAttributes, addRequestHeaderAttributes } from "./otel-graphql-utils";
import { getOtelTracer } from "./otel-tracer";

type Definition = {
  name: {
    value: string;
  };
};

// TODO
type Operation = {
  kind: any;
  query: any;
  key: any;
  context: any;
  variables: any;
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

const onOperation = (operation: Operation) => {
  const span = getOtelTracer().startSpan(
    "graphql-request",
    {
      kind: SpanKind.CLIENT,
    },
    context.active(),
  );

  span.setAttribute(
    AttributeNames.OPERATION_NAME,
    `${(operation.query.definitions[0] as Definition).name.value ?? "unknown"}`,
  );

  span.setAttribute(AttributeNames.OPERATION_TYPE, operation.kind);

  span.setAttribute(AttributeNames.OPERATION_BODY, operation.query.loc?.source.body ?? "unknown");

  span.setAttribute(AttributeNames.OPERATION_KEY, operation.key);

  span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, operation.context.url);
  span.setAttribute(SemanticAttributes.HTTP_URL, operation.context.url);

  console.log({ operation });

  addRequestHeaderAttributes(span, operation.context.fetchOptions?.headers);
  if (operation.variables) {
    addInputVariableAttributes(span, operation.variables);
  }

  /*
   * TODO
   * Investigate if `makeOperation` here is required
   */
  operation.context.span = span;
};

const onResult = ({ error, operation }: { error?: any; operation: ExtendedOperation }) => {
  const span = operation.context.span;

  if (error) {
    span.recordException(error);
  }

  span.setStatus({ code: error ? SpanStatusCode.ERROR : SpanStatusCode.OK });
  // console.log({ span });

  span.end();
};

export const otelExchangeHandlers = {
  onOperation,
  onResult,
};
