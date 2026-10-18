"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const FIELD_CLASS =
  "w-full rounded-xl border border-ink-900/15 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-flare-500 focus:outline-none focus:ring-2 focus:ring-flare-500/30";

function dashboardPath(role) {
  return role === "store" ? "/store/dashboard" : "/worker/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, authReady, profile, profileReady, signIn, signUp, saveRole, logOut } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupRole, setSignupRole] = useState("store");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authReady || !profileReady) return;
    if (user && profile?.role) {
      router.replace(dashboardPath(profile.role));
    }
  }, [authReady, profileReady, user, profile, router]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, signupRole);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || "認証に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRole = async (role) => {
    setError("");
    setSubmitting(true);
    try {
      await saveRole(role);
      router.replace(dashboardPath(role));
    } catch (err) {
      setError(err.message || "役割の保存に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const ready = authReady && profileReady;
  const needsRole = Boolean(user && !profile?.role);

  return (
    <main className="flex min-h-screen flex-col bg-ink-950">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-flare-500 font-display text-2xl font-bold text-white shadow-card">
              SR
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              Shift Rescue
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              急な欠勤が出た瞬間、近くのワーカーに募集を届ける。
              <br />
              リアルタイムの欠員マッチングサービスです。
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-white p-6 shadow-card sm:p-8">
            {!ready || (user && profile?.role) ? (
              <p className="text-center text-sm text-ink-700/60">読み込み中です…</p>
            ) : needsRole ? (
              <>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-ink-700/60">
                  役割を選択してください
                </p>
                <p className="mb-4 text-center text-xs text-ink-700/70">{user.email}</p>
                <p className="mb-4 text-center text-sm text-ink-700/70">
                  一度選ぶと、このアカウントの役割は変わりません。
                </p>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveRole("store")}
                  className="flex w-full items-center justify-between rounded-xl border border-ink-900/10 bg-ink-900 px-5 py-4 text-left transition hover:bg-ink-800 disabled:opacity-60"
                >
                  <span>
                    <span className="block font-display text-base font-semibold text-white">
                      店舗として登録
                    </span>
                    <span className="mt-0.5 block text-xs text-white/60">
                      欠員募集の投稿・採用管理を行う
                    </span>
                  </span>
                  <span aria-hidden className="text-xl text-flare-400">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveRole("worker")}
                  className="flex w-full items-center justify-between rounded-xl border border-ink-900/10 bg-white px-5 py-4 text-left transition hover:border-ink-900/25 disabled:opacity-60"
                >
                  <span>
                    <span className="block font-display text-base font-semibold text-ink-900">
                      ワーカーとして登録
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-700/60">
                      近くの募集を探して応募する
                    </span>
                  </span>
                  <span aria-hidden className="text-xl text-flare-500">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={logOut}
                  className="w-full text-center text-xs font-medium text-ink-700/50 hover:text-ink-900"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-700/60">
                  メールアドレスで{mode === "signup" ? "新規登録" : "ログイン"}
                </p>

                <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-ink-900/5 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      mode === "login"
                        ? "bg-white text-ink-900 shadow-sm"
                        : "text-ink-700/60 hover:text-ink-900"
                    }`}
                  >
                    ログイン
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      mode === "signup"
                        ? "bg-white text-ink-900 shadow-sm"
                        : "text-ink-700/60 hover:text-ink-900"
                    }`}
                  >
                    新規登録
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-900">
                      メールアドレス
                    </label>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      className={FIELD_CLASS}
                      placeholder="例：store@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-900">
                      パスワード
                    </label>
                    <input
                      required
                      type="password"
                      minLength={6}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className={FIELD_CLASS}
                      placeholder="6文字以上"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {mode === "signup" && (
                    <div>
                      <p className="mb-1.5 block text-sm font-semibold text-ink-900">役割</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSignupRole("store")}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            signupRole === "store"
                              ? "border-ink-900 bg-ink-900 text-white"
                              : "border-ink-900/15 text-ink-700 hover:border-ink-900/30"
                          }`}
                        >
                          店舗
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupRole("worker")}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            signupRole === "worker"
                              ? "border-ink-900 bg-ink-900 text-white"
                              : "border-ink-900/15 text-ink-700 hover:border-ink-900/30"
                          }`}
                        >
                          ワーカー
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-ink-700/60">
                        登録後に役割は変更できません。
                      </p>
                    </div>
                  )}

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
                  >
                    {submitting
                      ? "送信中…"
                      : mode === "signup"
                        ? "この役割で登録する"
                        : "ログインする"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            ※ 役割はアカウントに保存されます。未ログインでは店舗・ワーカー画面を開けません。
          </p>
        </div>
      </div>
    </main>
  );
}
