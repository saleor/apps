import Image, { ImageProps } from "next/image";
import { TaxProviderName } from "../../taxes/providers";
import { providerConfig } from "../../taxes/providers/config";

type Size = "small" | "medium" | "large" | "xlarge";

const sizes: Record<Size, number> = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
};

type ProviderIconProps = {
  provider: TaxProviderName;
  size?: Size;
} & Omit<ImageProps, "src" | "height" | "width">;

export const ProviderIcon = ({ provider, size = "medium", ...props }: ProviderIconProps) => {
  const { icon, label } = providerConfig[provider];
  const matchedSize = sizes[size];
  return (
    <Image src={icon} alt={`${label} icon`} width={matchedSize} height={matchedSize} {...props} />
  );
};
