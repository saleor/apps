import "./skeleton.css";

import { Box, type SkeletonProps as MacawSkeletonProps } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ComponentProps } from "react";

export type SkeletonProps = MacawSkeletonProps;

/**
 * Loading placeholder that matches Dashboard voucher and channel detail skeletons:
 * a light mix of the default border into the page background, breathing rather than fading.
 *
 * Macaw's own `Skeleton` in an app that imports `@saleor/apps-ui-next/style` gets the same fill
 * via `[data-macaw-ui-component="Skeleton"]`. Prefer this component for new bars so the default
 * radius stays `2` and the class is on the element even if the document stylesheet is missing.
 */
export const Skeleton = ({ className, borderRadius = 2, ...props }: SkeletonProps): JSX.Element => (
  <Box
    {...(props as ComponentProps<typeof Box>)}
    borderRadius={borderRadius}
    className={clsx("apps-ui-skeleton", className)}
  />
);

Skeleton.displayName = "Skeleton";
