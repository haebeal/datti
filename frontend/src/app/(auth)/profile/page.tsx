import { redirect } from "next/navigation";
import { getMe } from "@/features/user/actions/getMe";
import { getSubscriptions } from "@/features/user/actions/getSubscriptions";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import { LineLinkSection } from "@/features/user/components/line-link-section";
import { NotificationSection } from "@/features/user/components/notification-section";
import { cn } from "@/utils/cn";

export default async function ProfilePage() {
  const result = await getMe();

  if (!result.success) {
    redirect("/auth");
  }

  const isLineLinked = result.user.lineUserId != null;
  const subscriptionsResult = isLineLinked
    ? await getSubscriptions()
    : null;
  const lineSubscription =
    subscriptionsResult?.success
      ? subscriptionsResult.subscriptions.find((s) => s.channel === "line") ??
        null
      : null;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>プロフィール</h1>
      <ProfileEditForm user={result.user} />
      <LineLinkSection lineUserId={result.user.lineUserId ?? null} />
      <NotificationSection
        subscription={lineSubscription}
        isLineLinked={isLineLinked}
      />
    </div>
  );
}
