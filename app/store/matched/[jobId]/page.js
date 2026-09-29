"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { useApp } from "@/context/AppContext";

export default function StoreMatchedPage({ params }) {
  const { jobId } = params;
  const { getJob } = useApp();

  const job = getJob(jobId);
  const matchedApplicant = job
    ? (job.applicants || []).find((a) => a.id === job.matchedApplicantId)
    : null;

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="店舗モード" />

      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rescue-500 text-3xl text-white shadow-card">
          ✓
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
          マッチングが完了しました
        </h1>
        <p className="mt-2 text-sm text-ink-700/70">
          採用が確定しました。下記の連絡先へ、勤務開始時間などをできるだけ早く連絡してください。
        </p>

        {job && matchedApplicant && (
          <div className="mt-8 w-full rounded-2xl border border-rescue-400 bg-rescue-50/50 p-6 text-left shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-rescue-700">
              採用ワーカー
            </p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 font-display text-lg font-semibold text-white">
                {matchedApplicant.name.slice(0, 1)}
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {matchedApplicant.name}
                </p>
                <p className="text-sm text-ink-700/70">連絡先：{matchedApplicant.contact}</p>
              </div>
            </div>
            {matchedApplicant.message && (
              <p className="mt-3 text-sm text-ink-700/70">「{matchedApplicant.message}」</p>
            )}

            <div className="mt-5 border-t border-rescue-400/30 pt-4 text-sm text-ink-700">
              <p>
                <span className="text-ink-700/60">募集内容：</span>
                {job.position}（{job.workingHours}）
              </p>
              <p className="mt-1">
                <span className="text-ink-700/60">勤務地：</span>
                {job.location}
              </p>
            </div>
          </div>
        )}

        <Button as={Link} href="/store/dashboard" variant="secondary" className="mt-8">
          ダッシュボードに戻る
        </Button>
      </div>
    </main>
  );
}
