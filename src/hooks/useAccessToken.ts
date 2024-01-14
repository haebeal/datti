import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "@chakra-ui/react";

export const useAccessToken = () => {
  const toast = useToast();
  const { isLoading, getAccessTokenSilently, getAccessTokenWithPopup } =
    useAuth0();

  const getAccessToken = async () => {
    try {
      const accessToken = process.env.NEXT_PUBLIC_BASE_URL.startsWith(
        "http://localhost",
      )
        ? await getAccessTokenWithPopup()
        : await getAccessTokenSilently();

      if (!accessToken) {
        throw new Error("Faild to get Access Token");
      }

      return accessToken;
    } catch (error) {
      toast({
        status: "error",
        title: "アクセストークンの取得に失敗しました",
      });
      throw error;
    }
  };

  return { isLoading, getAccessToken };
};
