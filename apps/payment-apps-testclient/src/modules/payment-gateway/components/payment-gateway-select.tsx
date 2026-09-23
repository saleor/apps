"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { redirectToStripeDropin } from "@/modules/payment-gateway/actions/redirect-to-stripe-dropin";

import { redirectToAdyenDropin } from "../actions/redirect-to-adyen-dropin";
import { PaymentGatewayFragment } from "../fragments";

const PaymentGatewaySchema = z.object({
  paymentGatewayId: z.string(),
});

type PaymentGatewaySchemaType = z.infer<typeof PaymentGatewaySchema>;

export const PaymentGatewaySelect = (props: {
  data: FragmentOf<typeof PaymentGatewayFragment>[] | null | undefined;
}) => {
  const { data } = props;

  const availablePaymentGateways = readFragment(
    PaymentGatewayFragment,
    data?.map((method) => method) ?? [],
  );

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
    switch (data.paymentGatewayId) {
      case "app.saleor.stripe":
      case "saleor.app.payment.stripe": {
        toast({
          title: "Payment gateway selected",
          description: "Redirecting to Stripe",
        });

        return await redirectToStripeDropin({
          paymentGatewayId: data.paymentGatewayId,
        });
      }
      case "app.saleor.adyen_staging":
      case "app.saleor.adyen_preview":
      case "app.saleor.adyen": {
        toast({
          title: "Payment gateway selected",
          description: "Redirecting to Adyen",
        });

        return await redirectToAdyenDropin({
          paymentGatewayId: data.paymentGatewayId,
        });
      }
      default: {
        toast({
          title: "Not supported payment gateway",
          description: `The payment gateway ${data.paymentGatewayId} is not supported.`,
          variant: "destructive",
        });

        throw new Error(
          "Payment gateway is not supported. Check either app.saleor.stripe or app.saleor.adyen",
        );
      }
    }
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
