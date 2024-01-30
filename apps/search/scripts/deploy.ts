import { execSync } from "child_process";

execSync("pnpm run migrate", { stdio: "inherit" });
