import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";

type DeleteProviderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    gap: theme.spacing(1),
  },
}));

export const DeleteProviderDialog = (p: DeleteProviderDialogProps) => {
  const styles = useStyles();

  return (
    <Dialog open={p.isOpen} onClose={p.onClose}>
      <DialogTitle>Delete provider instance?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this provider instance? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <div className={styles.actions}>
          <Button onClick={p.onCancel}>Cancel</Button>
          <Button variant="primary" onClick={p.onConfirm}>
            Confirm
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
