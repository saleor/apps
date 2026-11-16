"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButton } from "@/components/form-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { type FragmentOf, readFragment } from "@/graphql/gql";

import { PaymentGatewayFragment } from "../fragments";
import { getPaymentGatewayPath, TERMINAL_GATEWAY_ID } from "../gateway-routing";

const PaymentGatewaySchema = z.object({
  paymentGatewayId: z.string(),
});

type PaymentGatewaySchemaType = z.infer<typeof PaymentGatewaySchema>;

export const PaymentGatewaySelect = (props: {
  envUrl: string;
  checkoutId: string;
  terminalEnabled?: boolean;
  data: FragmentOf<typeof PaymentGatewayFragment>[] | null | undefined;
}) => {
  const { data, envUrl, checkoutId, terminalEnabled } = props;
  const router = useRouter();

  const availablePaymentGateways = [
    ...readFragment(PaymentGatewayFragment, data?.map((method) => method) ?? []),
    ...(terminalEnabled ? [{ id: TERMINAL_GATEWAY_ID, name: "Square Terminal (staff)" }] : []),
  ];

  const getDefaultPaymentGatewayId = () => {
    // if there is only one available payment gateway, return its id
    if (availablePaymentGateways.length === 1) {
      return availablePaymentGateways[0]?.id;
    }

    // otherwise, return empty string
    return "";
  };

  const form = useForm<PaymentGatewaySchemaType>({
    resolver: zodResolver(PaymentGatewaySchema),
    defaultValues: {
      paymentGatewayId: getDefaultPaymentGatewayId(),
    },
  });

  async function onSubmit(data: PaymentGatewaySchemaType) {
    const path = getPaymentGatewayPath({
      envUrl,
      checkoutId,
      paymentGatewayId: data.paymentGatewayId,
    });

    if (!path) {
      toast({ title: "Payment gateway is not supported", variant: "destructive" });

      return;
    }
    router.push(path);
  }

  return (
    <section className="mx-auto w-full max-w-md py-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Payment Gateway Information</h2>
      </div>
      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
            <FormField
              control={form.control}
              name="paymentGatewayId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Gateway</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment gateway" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePaymentGateways.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center justify-around gap-1">
                            <span>{method.name}</span>
                            <span className="text-sm text-gray-500">({method.id})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid">
              <FormButton
                type="submit"
                className="justify-self-end"
                loading={form.formState.isSubmitting}
              >
                Submit
              </FormButton>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};
