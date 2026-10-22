"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

export function signOutUser() {
  return signOut(auth);
}

export function mapAuthError(error) {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "このメールアドレスはすでに登録されています。";
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";
    case "auth/weak-password":
      return "パスワードは6文字以上にしてください。";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "メールアドレスまたはパスワードが違います。";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。しばらく待ってから再度お試しください。";
    case "auth/network-request-failed":
      return "ネットワークエラーが発生しました。接続を確認してください。";
    default:
      return "認証に失敗しました。入力内容を確認してください。";
  }
}
