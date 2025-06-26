import { NextRequest } from "next/server";

export const POST = (req: NextRequest) => {
  /**
   * 1. Get which saleorApiUrl it's called
   * 2. Get dirty variants from DynamoDB (first X)
   * 2A -> IF NOTHING, RETURN EARLY
   * 3. Get Feed XML from S3
   * 4. Load to memory
   * 5. Fetch `productVariants` with IDs from dynamo
   * 6. Patch XML
   * 7. Upload XML
   * 8. Delete processed items from Dynamo
   * 9. Call itself again
   */

  return new Response("OK");
};
