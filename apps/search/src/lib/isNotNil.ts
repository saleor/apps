export const isNotNil = <T>(x: T | null | undefined): x is T => x !== undefined && x !== null;
