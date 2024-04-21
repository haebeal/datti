import { useNavigate } from "@remix-run/react";
import { GroupForm } from "~/components/GroupForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export default function GroupCreate() {
  const navigate = useNavigate();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate("/groups");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>グループ作成</DialogTitle>
        </DialogHeader>
        <GroupForm />
      </DialogContent>
    </Dialog>
  );
}
