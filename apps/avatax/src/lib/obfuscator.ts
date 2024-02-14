export class Obfuscator {
  obfuscate = (value: string) => {
    if (value.length < 4) {
      return "*".repeat(value.length);
    }

    return value.replace(/.(?=.{4})/g, "*");
  };

  /*
   * // ! What if the user password contains "****"? We shouldn't rely on the characters to verify the obfuscation,
   * // ! but rather on the context. For example, when updating a provider configuration,
   * // ! we could check if the value has changed. If it's the same as returned from the server, then it's obfuscated.
   */
  isObfuscated = (value: string) => value.includes("****");
}
