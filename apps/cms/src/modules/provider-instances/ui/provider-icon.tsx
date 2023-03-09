import { getProviderByName } from "../../providers/config";
import Image from "next/image";

interface ProviderIconProps {
  providerName: string;
}

const ProviderIcon = ({ providerName }: ProviderIconProps) => {
  const provider = getProviderByName(providerName);

  return provider ? <Image src={provider.iconSrc} alt={`${provider.label} icon`} /> : null;
};

export default ProviderIcon;
