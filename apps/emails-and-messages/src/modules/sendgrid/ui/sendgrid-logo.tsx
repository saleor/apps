import Image from "next/image";
import sendgrid from "../../../public/sendgrid.png";

interface SendgridLogoProps {
  height: number;
  width: number;
}

export const SendgridLogo = ({ height, width }: SendgridLogoProps) => {
  return <Image alt="SendGrid logo" src={sendgrid} height={height} width={width} />;
};
