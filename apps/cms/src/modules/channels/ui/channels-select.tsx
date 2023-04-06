import { MergedChannelSchema } from "../../../lib/cms/config";
import { FormControl, InputLabel, MenuItem, Select, SelectProps } from "@material-ui/core";

interface ChannelsListItemsProps extends SelectProps {
  channels: MergedChannelSchema[];
  activeChannel?: MergedChannelSchema | null;
  setActiveChannel: (channel: MergedChannelSchema | null) => void;
}

export const ChannelsSelect = ({
  channels,
  activeChannel,
  setActiveChannel,
  ...props
}: ChannelsListItemsProps) => {
  console.log(activeChannel);

  return (
    <FormControl>
      <InputLabel id="channel-select">Select channel to configure</InputLabel>

      <Select
        labelId="channel-select"
        {...props}
        variant="outlined"
        fullWidth
        value={activeChannel?.channel.id}
        onChange={(e, value) => {
          console.log(e.target.value);
          setActiveChannel(channels.find((c) => c.channel.id === e.target.value)!);
        }}
      >
        {channels.map((c) => (
          <MenuItem key={c.channel.id} value={c.channel.id}>
            {c.channel.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
