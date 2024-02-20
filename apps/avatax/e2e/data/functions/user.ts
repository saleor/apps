import { handler } from "pactum";
import { faker } from "@faker-js/faker";

handler.addDataFuncHandler("UserEmail", () => {
  return faker.internet.email();
});
