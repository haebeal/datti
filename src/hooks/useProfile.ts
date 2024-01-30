import { Profile } from "@/features/profile";
import { auth } from "@/utils/firebase";
import { useToast } from "@chakra-ui/react";
import {
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useProfile = () => {
  const { data: session } = useSession();
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);
  const [idToken, setIdToken] = useState<string | null>("");
  const [profile, setProfile] = useState<Profile | null>();

  useEffect(() => {
    if (session?.credential.idToken) {
      signInFirebaseAuth(session?.credential.idToken);
    } else {
      setIdToken(null);
      setProfile(null);
    }
  }, [session]);

  const signInFirebaseAuth = async (googleIdToken: string) => {
    setLoading(true);
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const { user } = await signInWithCredential(auth, credential);
    setProfile({
      email: user.email ?? "",
      name: user.displayName ?? "",
      picture: user.photoURL ?? "",
    });
    setIdToken(await user.getIdToken());
    setLoading(false);
  };

  const updateProfile = async (data: Profile) => {
    if (auth.currentUser) {
      setLoading(true);
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: data.picture,
      });
      toast({
        title: "プロフィールを更新しました",
        status: "success",
      });
      setProfile(data);
      setLoading(false);
    }
  };

  return { isLoading, profile, idToken, updateProfile };
};
