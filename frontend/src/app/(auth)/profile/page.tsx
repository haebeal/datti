import { redirect } from "next/navigation";
import { getMe } from "@/features/user/actions/getMe";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import { LineLinkSection } from "@/features/user/components/line-link-section";
import { cn } from "@/utils/cn";

export default async function ProfilePage() {
  const result = await getMe();

  if (!result.success) {
    redirect("/auth");
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>プロフィール</h1>
      <ProfileEditForm user={result.user} />
      <LineLinkSection lineUserId={result.user.lineUserId ?? null} />
    </div>
  );
}
