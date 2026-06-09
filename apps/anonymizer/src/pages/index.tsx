import { type NextPage } from "next";

import { ScrambleAllOrdersByEmail } from "@/modules/anonymize/scramble-orders-by-email";

const IndexPage: NextPage = () => {
  return <ScrambleAllOrdersByEmail />;
};

export default IndexPage;
