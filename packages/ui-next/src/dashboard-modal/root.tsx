import { Modal, type ModalRootProps } from "@saleor/macaw-ui";

export const Root = ({ children, onChange, open }: ModalRootProps): JSX.Element => (
  <Modal onChange={onChange} open={open}>
    {children}
  </Modal>
);
