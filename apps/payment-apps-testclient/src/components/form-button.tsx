import { Loader2 } from "lucide-react";

import { Button, type ButtonProps } from "./ui/button";

interface FormButtonProps extends ButtonProps {
  loading?: boolean;
}

export const FormButton = ({ loading, children, ...props }: FormButtonProps) => {
  return (
    <Button {...props} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
};
