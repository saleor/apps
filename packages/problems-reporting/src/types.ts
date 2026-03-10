import { type Client } from "urql";

export type UrqlMutationClient = Pick<Client, "mutation">;

export interface ProblemsLogger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}
