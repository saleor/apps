import { mockedEncryptionKey } from "@/__tests__/mocks/mocked-encryption-key";
import { Encryptor } from "@/lib/encryptor";

export const mockEncryptor = new Encryptor(mockedEncryptionKey);
