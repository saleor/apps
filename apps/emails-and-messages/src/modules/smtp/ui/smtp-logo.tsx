import Image from "next/image";
import smtp from "../../../public/smtp.svg";

interface SmtpLogoProps {
  height: number;
  width: number;
}

export const SmtpLogo = ({ height, width }: SmtpLogoProps) => {
  return <Image alt="SMTP logo" src={smtp} height={height} width={width} />;
};
