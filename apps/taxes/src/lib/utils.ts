const { randomUUID } = require("crypto"); // Added in: node v14.17.0

export const createId = (): string => randomUUID();
