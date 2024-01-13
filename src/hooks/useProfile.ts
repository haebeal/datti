import { useToast } from "@chakra-ui/react";

import { Profile, postProfile, profileScheme } from "@/features/profile";
import { useAuth0 } from "@auth0/auth0-react";

export const useProfile = () => {
  const { user, isLoading, getAccessTokenSilently, getAccessTokenWithPopup } =
    useAuth0();
  const toast = useToast();

  const getAccessToken = process.env.NEXT_PUBLIC_BASE_URL.startsWith(
    "http://localhost",
  )
    ? getAccessTokenWithPopup
    : getAccessTokenSilently;

  const profile = profileScheme.parse(user);

  const updateProfile = async (value: Partial<Profile>) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast({
        status: "error",
        title: "アクセストークンの取得に失敗しました",
      });
      return null;
    }

    try {
      const result = await postProfile(accessToken, value);
      toast({
        status: "success",
        title: "プロフィールを更新しました",
      });
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          status: "error",
          title: error.message,
        });
      } else {
        toast({
          status: "error",
          title: "不明なエラーが発生しました",
        });
      }
    }
  };

  return { profile, isLoading, updateProfile };
};
