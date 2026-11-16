import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

export const hash = (value: string) => bytesToHex(sha256(value));
