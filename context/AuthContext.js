"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { mapAuthError, signInWithEmail, signOutUser, signUpWithEmail } from "@/lib/auth";
import { createUserProfile, getUserProfile } from "@/lib/firestoreRest";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setProfileReady(true);
        return;
      }

      setProfileReady(false);
      try {
        const nextProfile = await getUserProfile(user.uid);
        if (!cancelled) {
          setProfile(nextProfile);
          setProfileReady(true);
        }
      } catch (error) {
        console.error("プロフィールの取得に失敗しました:", error);
        if (!cancelled) {
          setProfile(null);
          setProfileReady(true);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signUp = async (email, password, role) => {
    try {
      const credential = await signUpWithEmail(email, password);
      const nextProfile = await createUserProfile(credential.user.uid, {
        role,
        email: credential.user.email,
      });
      setProfile(nextProfile);
      setProfileReady(true);
    } catch (error) {
      if (error.message && !error.code) throw error;
      throw new Error(mapAuthError(error));
    }
  };

  const signIn = async (email, password) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const saveRole = async (role) => {
    if (!user) throw new Error("ログインしてください。");
    if (profile?.role) throw new Error("役割はすでに設定されています。");
    const nextProfile = await createUserProfile(user.uid, {
      role,
      email: user.email,
    });
    setProfile(nextProfile);
    setProfileReady(true);
    return nextProfile;
  };

  // プロフィールを取り直す（応募済みの記録や、店舗名の保存のあとに使う）
  const refreshProfile = async () => {
    if (!user) return;
    try {
      const nextProfile = await getUserProfile(user.uid);
      setProfile(nextProfile);
    } catch (error) {
      console.error("プロフィールの取得に失敗しました:", error);
    }
  };

  const logOut = async () => {
    await signOutUser();
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      profile,
      profileReady,
      signUp,
      signIn,
      saveRole,
      refreshProfile,
      logOut,
    }),
    [user, authReady, profile, profileReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
