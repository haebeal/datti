import { useToast } from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signOut as signOutFirebase,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { signOut as signOutNextAuth, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Profile } from "@/schema";
import { auth, storage } from "@/utils/firebase";

export const useFirebase = () => {
  const { data: session } = useSession();
  const toast = useToast();
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const [idToken, setIdToken] = useState<string | null>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.credential.idToken) {
      signInWithIdToken(session?.credential.idToken);
    }
  }, [session?.credential.idToken]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      user?.getIdToken().then((token) => setIdToken(token));
    });
    return unsub;
  }, []);

  const signInWithIdToken = async (googleIdToken: string) => {
    try {
      setLoading(true);
      const credential = GoogleAuthProvider.credential(googleIdToken);
      await signInWithCredential(auth, credential);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        toast({
          title: error.message,
          status: "error",
        });
      } else {
        toast({
          title: "不明なエラーが発生しました",
          status: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await signOutNextAuth();
      await signOutFirebase(auth);
      toast({
        title: "ログアウトしました",
        status: "info",
      });
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        toast({
          title: error.message,
          status: "error",
        });
      } else {
        toast({
          title: "不明なエラーが発生しました",
          status: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (currentUser) {
      try {
        setLoading(true);
        await updateFirebaseProfile(currentUser, data);
        toast({
          title: "プロフィールを更新しました",
          status: "success",
        });
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          toast({
            title: error.message,
            status: "error",
          });
        } else {
          toast({
            title: "不明なエラーが発生しました",
            status: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (currentUser) {
      try {
        setUploading(true);
        const storageRef = ref(storage, `images/profile/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        await updateFirebaseProfile(currentUser, {
          photoURL,
        });
        toast({
          title: "プロフィール画像を更新しました",
          status: "success",
        });
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          toast({
            title: error.message,
            status: "error",
          });
        } else {
          toast({
            title: "不明なエラーが発生しました",
            status: "error",
          });
        }
      } finally {
        setUploading(false);
      }
    }
  };

  return {
    isLoading,
    isUploading,
    currentUser,
    idToken,
    signOut,
    updateProfile,
    uploadProfilePhoto,
  };
};
