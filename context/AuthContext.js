"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { mapAuthError, signInWithEmail, signOutUser, signUpWithEmail } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    try {
      await signUpWithEmail(email, password);
    } catch (error) {
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

  const logOut = async () => {
    await signOutUser();
  };

  const value = useMemo(
    () => ({ user, authReady, signUp, signIn, logOut }),
    [user, authReady]
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
