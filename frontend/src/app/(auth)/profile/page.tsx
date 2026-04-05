import { redirect } from "next/navigation";
import { getMe } from "@/features/user/actions/getMe";
import { getSubscriptions } from "@/features/user/actions/getSubscriptions";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import { LineNotificationCard } from "@/features/user/components/line-notification-card";
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
    <div className={cn("w-full", "flex flex-col items-center gap-6")}>
      <h1 className={cn("hidden sm:block", "w-full max-w-[640px]", "text-3xl font-bold text-primary-base")}>
        マイページ
      </h1>
      <ProfileEditForm user={result.user} />
      <LineNotificationCard
        lineUserId={result.user.lineUserId ?? null}
        subscription={lineSubscription}
      />
    </div>
  );
}
