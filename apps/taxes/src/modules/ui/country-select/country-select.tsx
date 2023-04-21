import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@saleor/macaw-ui";
import { ControllerRenderProps } from "react-hook-form";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { countries } from "./countries";
import React from "react";

type CountrySelectProps = ControllerRenderProps<ChannelConfig, "address.country">;

// TODO: replace with macaw-ui component
const useStyles = makeStyles({
  root: {
    padding: "7px 9px !important",
  },
  clearIndicator: {
    marginRight: 2,
  },
});

// eslint-disable-next-line react/display-name
export const CountrySelect = React.forwardRef((p: CountrySelectProps, ref) => {
  const styles = useStyles();
  const { onChange, value } = p;

  return (
    <Autocomplete
      classes={{
        inputRoot: styles.root,
        clearIndicator: styles.clearIndicator,
      }}
      options={countries}
      onChange={(_, data) => onChange(data ? data.code : null)}
      value={
        countries.find((country) => {
          return value === country.code;
        }) ?? null
      }
      getOptionLabel={(option) => option.label}
      renderInput={(params) => <TextField {...params} inputRef={ref} placeholder={"Country"} />}
    />
  );
});
