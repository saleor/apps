import { IndexSaleorProducts } from "./index-saleor-products/index-saleor-products";

require("dotenv").config();
const { run } = require("graphile-worker");

/**
 * todo probably use another DB so Prisma will not destroy queue?
 *
 * how it will expose itself to kubernetes
 */
async function main() {
  // Run a worker to execute jobs:
  const runner = await run({
    connectionString: process.env.DATABASE_URL as string,
    concurrency: 5,
    // Install signal handlers for graceful shutdown on SIGINT, SIGTERM, etc
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      IndexSaleorProducts,
    },
  });

  await runner.promise;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
