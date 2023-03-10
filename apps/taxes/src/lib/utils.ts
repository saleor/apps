const { randomUUID } = require("crypto"); // Added in: node v14.17.0

export const createId = (): string => randomUUID();

export const obfuscateSecret = (value: string) => value.replace(/.(?=.{4})/g, "*");

export const isObfuscated = (value: string) => value.includes("****");
