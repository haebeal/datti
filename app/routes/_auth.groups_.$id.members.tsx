import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { GroupMembersLoader } from "~/.server/loaders";
import { MemberList } from "~/components/MemberList";
import { Button } from "~/components/ui/button";

export { groupMembersLoader as loader } from "~/.server/loaders";

export default function GroupMembers() {
  const { pathname } = useLocation();
  const { state } = useNavigation();

  const { members } = useLoaderData<GroupMembersLoader>();

  return (
    <div className="flex flex-col py-3 gap-3">
      <div className="flex flex-row-reverse items-center justify-items-end">
        <Link className="flex items-center" to={`${pathname}/add`}>
          <Button
            disabled={state === "loading"}
            className="bg-sky-500 hover:bg-sky-600 font-semibold"
          >
            メンバー追加
          </Button>
        </Link>
      </div>
      <MemberList members={members} />
      <Outlet />
    </div>
  );
}
