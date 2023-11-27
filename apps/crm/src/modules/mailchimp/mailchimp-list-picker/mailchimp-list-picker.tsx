import { Box, PropsWithBox } from "@saleor/macaw-ui";
import { ChangeEvent, useEffect } from "react";
import { trpcClient } from "../../trpc/trpc-client";

type Props = PropsWithBox<{
  disabled?: boolean;
  onChange(e: ChangeEvent<HTMLSelectElement> | null, listId: string): void;
}>;

export const MailchimpListPicker = ({ disabled, onChange, ...props }: Props) => {
  const { isSuccess, data, isLoading } = trpcClient.mailchimp.audience.getLists.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        if (data?.length) {
          onChange(null, data[0].id);
        }
      },
    }
  );

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
