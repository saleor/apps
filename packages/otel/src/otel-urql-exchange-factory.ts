import { context, Span, SpanKind, SpanStatusCode, Tracer } from "@opentelemetry/api";
import { ATTR_URL_FULL } from "@opentelemetry/semantic-conventions/incubating";
import { type CombinedError, makeOperation, mapExchange, Operation } from "urql";

import { ObservabilityAttributes } from "./observability-attributes";

type Definition = {
  name: {
    value: string;
  };
};

type ExtendedOperationContext = Operation["context"] & {
  span: Span;
};

interface ExtendedOperation extends Operation {
  context: ExtendedOperationContext;
}

const GraphQLAttributeNames = {
  OPERATION_TYPE: "graphql.operation.type",
  OPERATION_NAME: "graphql.operation.name",
  OPERATION_BODY: "graphql.operation.body",
  OPERATION_KEY: "graphql.operation.key",
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

      span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, operation.context.url);

      span.setAttribute(ATTR_URL_FULL, operation.context.url);

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
