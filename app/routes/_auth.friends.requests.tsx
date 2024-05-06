import { useLoaderData, useNavigate } from "@remix-run/react";
import { FriendsRequestsLoader } from "~/.server/loaders";
import { FriendRequestForm } from "~/components/FriendRequestForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export { friendsRequestsAction as action } from "~/.server/actions";
export { friendsRequestsLoader as loader } from "~/.server/loaders";

export default function FriendRequest() {
  const navigate = useNavigate();
  const { users } = useLoaderData<FriendsRequestsLoader>();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate("/friends");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フレンド申請</DialogTitle>
        </DialogHeader>
        <FriendRequestForm users={users} />
      </DialogContent>
    </Dialog>
  );
}
