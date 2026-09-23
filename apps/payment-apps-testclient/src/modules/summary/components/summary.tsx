"use client";

import { lightFormat } from "date-fns";
import { Copy, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

import { FormButton } from "@/components/form-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { type FragmentOf, readFragment } from "@/graphql/gql";
import { clearIdempotencyKey } from "@/lib/idempotency-key";

import { CheckoutFragment } from "../fragments";
import { useCompleteCheckoutMutation } from "../use-complete-checkout-mutation";

const getDashboardUrl = (envUrl: string, orderId: string) => {
  const dashboardUrl = envUrl.replace("/graphql/", "/dashboard");

  return `${dashboardUrl}/orders/${orderId}`;
};

export const Summary = (props: {
  data: FragmentOf<typeof CheckoutFragment> | null;
  envUrl: string;
}) => {
  const { mutateAsync: completeCheckout } = useCompleteCheckoutMutation();

  const { data, envUrl } = props;
  const checkout = readFragment(CheckoutFragment, data);

  if (!checkout) {
    return null;
  }

  const onCompleteButtonClick = async () => {
    const response = await completeCheckout();

    if (response) {
      clearIdempotencyKey();
      toast({
        title: "Successfully completed checkout",
        description: (
          <div className="flex items-center justify-around gap-3">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(response.checkoutComplete?.order?.id ?? "");
              }}
              variant="secondary"
            >
              Copy order id
            </Button>
            <Link
              href={getDashboardUrl(envUrl, response.checkoutComplete?.order?.id ?? "")}
              target="_blank"
            >
              <Button variant="link" className="flex gap-1">
                <span>Go to order page</span>
                <SquareArrowOutUpRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        ),
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            <p className="w-1/2 truncate">Checkout {checkout.id}</p>
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 p-1"
              onClick={() => {
                navigator.clipboard.writeText(checkout.id);
                toast({
                  title: "Checkout ID copied to clipboard",
                });
              }}
            >
              <Copy />
            </Button>
          </CardTitle>
          <CardDescription>
            Date: {lightFormat(checkout.created as string, "yyyy-MM-dd HH:mm")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Checkout Details</div>
          <ul className="grid gap-3">
            {checkout.lines.map((line) => (
              <li className="flex items-center justify-between" key={line.id}>
                <span className="text-muted-foreground">
                  {line.variant.product.name} x <span>{line.quantity}</span>
                </span>
                <span className="tabular-nums">
                  {line.totalPrice.gross.amount} {line.totalPrice.currency}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {checkout.subtotalPrice.gross.amount} {checkout.subtotalPrice.currency}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">
                {checkout.shippingPrice.gross.amount} {checkout.shippingPrice.currency}
              </span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span className="tabular-nums">
                {checkout.totalPrice.gross.amount} {checkout.totalPrice.currency}
              </span>
            </li>
          </ul>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <div className="font-semibold">Shipping Information</div>
            <address className="grid gap-0.5 not-italic text-muted-foreground">
              <span>{checkout.shippingAddress?.streetAddress1}</span>
              <span>
                {checkout.shippingAddress?.city}, {checkout.shippingAddress?.countryArea}{" "}
                {checkout.shippingAddress?.postalCode}
              </span>
              <span>{checkout.shippingAddress?.country.country}</span>
            </address>
          </div>
          <div className="grid auto-rows-max gap-3 text-right">
            <div className="font-semibold">Billing Information</div>
            <address className="grid gap-0.5 not-italic text-muted-foreground">
              <span>{checkout.billingAddress?.streetAddress1}</span>
              <span>
                {checkout.billingAddress?.city}, {checkout.billingAddress?.countryArea}{" "}
                {checkout.billingAddress?.postalCode}
              </span>
              <span>{checkout.billingAddress?.country.country}</span>
            </address>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Customer Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Customer</dt>
              <dd>
                {checkout.billingAddress?.firstName} {checkout.billingAddress?.lastName}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href="#">{checkout.email}</a>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>
                <a href="#">{checkout.billingAddress?.phone}</a>
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-between gap-3 border-t bg-muted/50 px-6 py-3">
        <Link href="/">
          <Button variant="link" onClick={() => clearIdempotencyKey()}>
            Go to home page
          </Button>
        </Link>
        <FormButton onClick={onCompleteButtonClick} data-testid="button-complete-checkout">
          Complete checkout
        </FormButton>
      </CardFooter>
    </Card>
  );
};
