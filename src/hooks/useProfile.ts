import { Profile } from "@/features/profile";
import { auth, storage } from "@/utils/firebase";
import { useToast } from "@chakra-ui/react";
import {
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useProfile = () => {
  const { data: session } = useSession();
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [idToken, setIdToken] = useState<string | null>("");
  const [profile, setProfile] = useState<Profile | null>();

  useEffect(() => {
    if (session?.credential.idToken) {
      signInFirebaseAuth(session?.credential.idToken);
    } else {
      setIdToken(null);
      setProfile(null);
    }
  }, []);

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

  const updateProfile = async (data: Partial<Profile>) => {
    if (auth.currentUser && profile) {
      setLoading(true);
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.name,
      });
      toast({
        title: "プロフィールを更新しました",
        status: "success",
      });
      setProfile({ ...profile, name: data.name ?? profile.name });
      setLoading(false);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (auth.currentUser && profile) {
      setUploading(true);
      const storageRef = ref(storage, `images/profile/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      toast({
        title: "プロフィール画像を更新しました",
        status: "success",
      });
      await firebaseUpdateProfile(auth.currentUser, {
        photoURL,
      });
      setProfile({ ...profile, picture: photoURL });
      setUploading(false);
    }
  };

  return {
    isLoading,
    isUploading,
    profile,
    idToken,
    updateProfile,
    uploadProfilePhoto,
  };
};
