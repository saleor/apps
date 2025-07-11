// todo consider having shared test mocks shared package
import { AuthData } from "@saleor/app-sdk/APL";

export const mockedAuthData = {
  appId: "app-id-1",
  saleorApiUrl: "http://localhost:8080/graphql/",
  token: "mock-app-token",
} satisfies AuthData;
