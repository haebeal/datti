import { redirect } from "next/navigation";
import { getMe } from "@/features/user/actions/getMe";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import { cn } from "@/utils/cn";

export default async function ProfilePage() {
  const result = await getMe();

  if (!result.success) {
    redirect("/auth");
  }

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>プロフィール</h1>
      <ProfileEditForm user={result.user} />
    </div>
  );
}
