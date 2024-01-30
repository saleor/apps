import { execSync } from "child_process";

console.log("Calling deploy script");

execSync("pnpm run migrate", { stdio: "inherit" });
