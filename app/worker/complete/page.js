"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Button from "@/components/Button";

export default function WorkerCompletePage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="ワーカーモード" />

      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-flare-500 text-3xl text-white shadow-card">
          ✓
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
          応募が完了しました
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-700/70">
          店舗側で応募内容を確認しています。採用が決まり次第、通知でお知らせします。
          <br />
          このまま少しお待ちください。
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} href="/worker/dashboard" variant="secondary">
            募集一覧に戻る
          </Button>
        </div>
      </div>
    </main>
  );
}
