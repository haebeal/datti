import { useNavigate } from "@remix-run/react";
import { EventForm } from "~/components/EventForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export { eventCreateAction as action } from "~/.server/actions";

export default function GroupEventCreate() {
  const navigate = useNavigate();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate(-1);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フレンド申請</DialogTitle>
        </DialogHeader>
        <EventForm />
      </DialogContent>
    </Dialog>
  );
}
