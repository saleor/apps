import { Section } from "../../ui/app-section";
import { ChannelList } from "./channel-list";

const Intro = () => {
  return (
    <Section.Description
      title="Channel providers"
      description={<>Each channel can have a different tax provider.</>}
    />
  );
};

export const ChannelSection = () => {
  return (
    <>
      <Intro />
      <ChannelList />
    </>
  );
};
