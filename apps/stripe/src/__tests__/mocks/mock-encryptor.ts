import { Encryptor } from "@saleor/apps-shared/encryptor";

import { mockedEncryptionKey } from "@/__tests__/mocks/mocked-encryption-key";

export const mockEncryptor = new Encryptor(mockedEncryptionKey);
