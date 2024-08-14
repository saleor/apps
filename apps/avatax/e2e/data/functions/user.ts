import { faker } from "@faker-js/faker";
import { handler } from "pactum";

handler.addDataFuncHandler("UserEmail", () => {
  return faker.internet.email();
});
