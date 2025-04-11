import { procedure } from "@/modules/trpc/trpc-server";

/**
 * Subset of protectedClientProcedure - for testing. It doesn't validate JWT
 *
 * TODO: It can be filled with context, but it causes issues with mocks and typescript. To be revisited
 */
export const TEST_Procedure = procedure;
