import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: string; output: string };
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: string; output: string };
  /** The `Day` scalar type represents number of days by integer value. */
  Day: { input: string; output: string };
  /**
   * Custom Decimal implementation.
   *
   * Returns Decimal as a float in the API,
   * parses float to the Decimal on the way back.
   */
  Decimal: { input: number; output: number };
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: JSONValue; output: JSONValue };
  /** The `Hour` scalar type represents number of hours by integer value. */
  Hour: { input: number; output: number };
  JSON: { input: JSONValue; output: JSONValue };
  JSONString: { input: string; output: string };
  /**
   * Metadata is a map of key-value pairs, both keys and values are `String`.
   *
   * Example:
   * ```
   * {
   *     "key1": "value1",
   *     "key2": "value2"
   * }
   * ```
   */
  Metadata: { input: Record<string, string>; output: Record<string, string> };
  /** The `Minute` scalar type represents number of minutes by integer value. */
  Minute: { input: number; output: number };
  /**
   * Nonnegative Decimal scalar implementation.
   *
   * Should be used in places where value must be nonnegative (0 or greater).
   */
  PositiveDecimal: { input: number; output: number };
  /**
   * Positive Integer scalar implementation.
   *
   * Should be used in places where value must be positive (greater than 0).
   */
  PositiveInt: { input: number; output: number };
  UUID: { input: string; output: string };
  /** Variables of this type must be set to null in mutations. They will be replaced with a filename from a following multipart part containing a binary file. See: https://github.com/jaydenseric/graphql-multipart-request-spec. */
  Upload: { input: unknown; output: unknown };
  WeightScalar: { input: number; output: number };
  /** _Any value scalar as defined by Federation spec. */
  _Any: { input: unknown; output: unknown };
};

export type AppProblemCreateErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND" | "REQUIRED";

export type AppProblemCreateInput = {
  /** Time window in minutes for aggregating problems with the same key. Defaults to 60. If 0, a new problem is always created. */
  readonly aggregationPeriod?: InputMaybe<Scalars["Minute"]["input"]>;
  /** If set, the problem becomes critical when count reaches this value. If sent again with higher value than already counted, problem can be de-escalated. */
  readonly criticalThreshold?: InputMaybe<Scalars["PositiveInt"]["input"]>;
  /** Key identifying the type of problem. App can add multiple problems under the same key, to merge them together or delete them in batch. Must be between 3 and 128 characters. */
  readonly key: Scalars["String"]["input"];
  /** The problem message to display. Must be at least 3 characters. Messages longer than 2048 characters will be truncated to 2048 characters with '...' suffix. */
  readonly message: Scalars["String"]["input"];
};

export type AppProblemDismissErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "OUT_OF_SCOPE_APP"
  | "REQUIRED";

export type AppProblemCreateMutationVariables = Exact<{
  input: AppProblemCreateInput;
}>;

export type AppProblemCreateMutation = {
  readonly appProblemCreate?: {
    readonly errors: ReadonlyArray<{
      readonly message?: string | null;
      readonly code: AppProblemCreateErrorCode;
      readonly field?: string | null;
    }>;
  } | null;
};

export type AppProblemDismissByKeyMutationVariables = Exact<{
  keys?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]> | Scalars["String"]["input"]>;
}>;

export type AppProblemDismissByKeyMutation = {
  readonly appProblemDismiss?: {
    readonly errors: ReadonlyArray<{
      readonly field?: string | null;
      readonly code: AppProblemDismissErrorCode;
      readonly message?: string | null;
    }>;
  } | null;
};

export const AppProblemCreateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AppProblemCreate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AppProblemCreateInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appProblemCreate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                      { kind: "Field", name: { kind: "Name", value: "code" } },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppProblemCreateMutation, AppProblemCreateMutationVariables>;
export const AppProblemDismissByKeyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AppProblemDismissByKey" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "keys" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appProblemDismiss" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "byApp" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "keys" },
                            value: { kind: "Variable", name: { kind: "Name", value: "keys" } },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      { kind: "Field", name: { kind: "Name", value: "code" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AppProblemDismissByKeyMutation,
  AppProblemDismissByKeyMutationVariables
>;
