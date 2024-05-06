import { useLoaderData, useNavigate } from "@remix-run/react";
import { GroupMemberAddLoader } from "~/.server/loaders";
import { MemberAddForm } from "~/components/MemberAddForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export { groupMemberAddAction as action } from "~/.server/actions";
export { groupMemberAddLoader as loader } from "~/.server/loaders";

export default function GroupMemberAdd() {
  const navigate = useNavigate();
  const { users } = useLoaderData<GroupMemberAddLoader>();

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
          <DialogTitle>メンバー追加</DialogTitle>
        </DialogHeader>
        <MemberAddForm users={users} />
      </DialogContent>
    </Dialog>
  );
}
