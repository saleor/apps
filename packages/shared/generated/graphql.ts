import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: string; output: string; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: string; output: string; }
  /** The `Day` scalar type represents number of days by integer value. */
  Day: { input: string; output: string; }
  /**
   * Custom Decimal implementation.
   *
   * Returns Decimal as a float in the API,
   * parses float to the Decimal on the way back.
   */
  Decimal: { input: number; output: number; }
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: JSONValue; output: JSONValue; }
  /** The `Hour` scalar type represents number of hours by integer value. */
  Hour: { input: number; output: number; }
  JSON: { input: JSONValue; output: JSONValue; }
  JSONString: { input: string; output: string; }
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
  Metadata: { input: Record<string, string>; output: Record<string, string>; }
  /** The `Minute` scalar type represents number of minutes by integer value. */
  Minute: { input: number; output: number; }
  /**
   * Nonnegative Decimal scalar implementation.
   *
   * Should be used in places where value must be nonnegative (0 or greater).
   */
  PositiveDecimal: { input: number; output: number; }
  /**
   * Positive Integer scalar implementation.
   *
   * Should be used in places where value must be positive (greater than 0).
   */
  PositiveInt: { input: number; output: number; }
  UUID: { input: string; output: string; }
  /** Variables of this type must be set to null in mutations. They will be replaced with a filename from a following multipart part containing a binary file. See: https://github.com/jaydenseric/graphql-multipart-request-spec. */
  Upload: { input: unknown; output: unknown; }
  WeightScalar: { input: number; output: number; }
  /** _Any value scalar as defined by Federation spec. */
  _Any: { input: unknown; output: unknown; }
};

export type MetadataInput = {
  /** Key of a metadata item. */
  readonly key: Scalars['String']['input'];
  /** Value of a metadata item. */
  readonly value: Scalars['String']['input'];
};

export type RemovePrivateMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  keys: ReadonlyArray<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type RemovePrivateMetadataMutation = { readonly deletePrivateMetadata?: { readonly errors: ReadonlyArray<{ readonly message?: string | null }> } | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ReadonlyArray<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { readonly updatePrivateMetadata?: { readonly item?: { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | null };

export type FetchAppDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAppDetailsQuery = { readonly app?: { readonly id: string, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null };


export const RemovePrivateMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemovePrivateMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keys"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keys"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<RemovePrivateMetadataMutation, RemovePrivateMetadataMutationVariables>;
export const UpdateAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAppMetadataMutation, UpdateAppMetadataMutationVariables>;
export const FetchAppDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<FetchAppDetailsQuery, FetchAppDetailsQueryVariables>;