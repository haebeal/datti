import { useActionData, useLoaderData } from "@remix-run/react";
import { GroupSettingsAction } from "~/.server/actions";
import { GroupLoader } from "~/.server/loaders";
import { GroupForm } from "~/components/GroupForm";

export { groupSettingsAction as action } from "~/.server/actions";
export { groupLoader as loader } from "~/.server/loaders";

export default function GroupSettings() {
  const { group } = useLoaderData<GroupLoader>();
  const lastResult = useActionData<GroupSettingsAction>();

  return (
    <div className="py-4">
      <GroupForm
        defaultValue={group}
        lastResult={lastResult}
        buttonLabel="更新"
      />
    </div>
  );
}
