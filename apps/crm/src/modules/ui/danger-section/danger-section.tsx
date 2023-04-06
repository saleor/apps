import { PropsWithBox } from "@saleor/macaw-ui/next";
import { Section } from "../section/section";

type Props = PropsWithBox<{}>;

export const DangerSection = (props: Props) => {
  return (
    <Section
      backgroundColor="surfaceCriticalHighlight"
      borderColor="criticalHighlight"
      {...props}
    />
  );
};
