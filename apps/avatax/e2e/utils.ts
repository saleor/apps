/*
 * In tests we want to use raw strings for GraphQL queries in PactumJS
 * In order to trick code editor to highlight the code as GraphQL syntax we need to use gql tag
 *
 * String.raw is used so that the string is left as is, unlink gql from graphql-tag which
 * parses the string into GraphQL AST
 */
export const gql = String.raw;
