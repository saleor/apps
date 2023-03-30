import { Box, PropsWithBox } from "@saleor/macaw-ui/next";
import { ChangeEvent } from "react";
import { trpcClient } from "../../trpc/trpc-client";

type Props = PropsWithBox<{
  disabled?: boolean;
  onChange(e: ChangeEvent<HTMLSelectElement>, listId: string): void;
}>;

export const MailchimpListPicker = ({ disabled, onChange, ...props }: Props) => {
  const { isSuccess, data, isLoading } = trpcClient.mailchimp.audience.getLists.useQuery();

  if (isSuccess && !data) {
    console.error("Fetched empty audiences list, should not happen");
  }

  return (
    <Box {...props}>
      <select
        disabled={disabled || isLoading}
        onChange={(e) => {
          onChange(e, e.currentTarget.value);
        }}
      >
        {data?.map((list) => (
          <option value={list.id} key={list.id}>
            {list.name}
          </option>
        ))}
      </select>
    </Box>
  );
};
