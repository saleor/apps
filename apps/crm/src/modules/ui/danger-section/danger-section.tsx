import { PropsWithBox } from "@saleor/macaw-ui";
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
