export class Obfuscator {
  obfuscate = (value: string) => {
    if (value.length < 4) {
      return "*".repeat(value.length);
    }

    return value.replace(/.(?=.{4})/g, "*");
  };

  isObfuscated = (value: string) => value.includes("****");
}
