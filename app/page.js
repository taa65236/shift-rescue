"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useApp();

  const handleLogin = (role) => {
    setRole(role);
    router.push(role === "store" ? "/store/dashboard" : "/worker/dashboard");
  };

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
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-ink-700/60">
              ログイン方法を選択してください
            </p>

            <button
              onClick={() => handleLogin("store")}
              className="flex w-full items-center justify-between rounded-xl border border-ink-900/10 bg-ink-900 px-5 py-4 text-left transition hover:bg-ink-800"
            >
              <span>
                <span className="block font-display text-base font-semibold text-white">
                  店舗としてログイン
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
              onClick={() => handleLogin("worker")}
              className="flex w-full items-center justify-between rounded-xl border border-ink-900/10 bg-white px-5 py-4 text-left transition hover:border-ink-900/25"
            >
              <span>
                <span className="block font-display text-base font-semibold text-ink-900">
                  ワーカーとしてログイン
                </span>
                <span className="mt-0.5 block text-xs text-ink-700/60">
                  近くの募集を探して応募する
                </span>
              </span>
              <span aria-hidden className="text-xl text-flare-500">
                →
              </span>
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            ※ 本デモはダミーデータで動作します。実際のログイン認証は行われません。
          </p>
        </div>
      </div>
    </main>
  );
}
