"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Button from "@/components/Button";
import JobCard from "@/components/JobCard";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { LINE_COMMUNITY_URL, shareJobToLine } from "@/lib/line";

export default function StoreDashboardPage() {
  const { jobs, loading, closeJob } = useApp();
  const { user } = useAuth();
  const [showMatched, setShowMatched] = useState(false);
  const [error, setError] = useState("");

  // 自分（ログイン中の店舗）が出した募集だけを表示する
  const myJobs = jobs.filter((job) => user && job.ownerId === user.uid);
  // 取り消した募集（closed）は、一覧に出さない
  const openJobs = myJobs.filter((job) => job.status === "open");
  const matchedJobs = myJobs.filter((job) => job.status === "matched");

  const handleClose = async (job) => {
    const ok = window.confirm(
      `「${job.position}」の募集を取り消しますか？\nワーカーの一覧から消え、応募できなくなります。`
    );
    if (!ok) return;
    setError("");
    try {
      await closeJob(job.id);
    } catch (err) {
      setError(err.message || "募集の取り消しに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="店舗モード" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">
              募集ダッシュボード
            </h1>
            <p className="mt-1 text-sm text-ink-700/70">
              現在の欠員募集状況を確認し、必要なときはすぐに新しい募集を出せます。
            </p>
          </div>
          <Button as={Link} href="/store/new-request" variant="primary">
            ＋ 欠員を募集する
          </Button>
        </div>

        {LINE_COMMUNITY_URL && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-rescue-400/50 bg-rescue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-800">
              募集を出したら、「LINEで知らせる」で、学生のLINEグループにも共有できます。
              先にオープンチャットに参加しておくと、すぐ送れます。
            </p>
            <Button
              as="a"
              href={LINE_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="shrink-0"
            >
              LINEオープンチャットに参加
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white p-10 text-center text-sm text-ink-700/60">
              読み込み中です…
            </div>
          ) : openJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white p-10 text-center text-sm text-ink-700/60">
              現在募集中の欠員はありません。「欠員を募集する」から新しい募集を作成してください。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {openJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  footer={
                    <div className="flex flex-col gap-2">
                      <Button
                        as={Link}
                        href={`/store/applicants/${job.id}`}
                        variant="secondary"
                        className="w-full"
                      >
                        応募者を見る（{job.applicantCount || 0}人）
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => shareJobToLine(job)}
                      >
                        LINEで知らせる
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => handleClose(job)}
                      >
                        この募集を取り消す
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {matchedJobs.length > 0 && (
          <div className="mt-10 border-t border-ink-900/10 pt-6">
            <button
              onClick={() => setShowMatched((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-semibold text-ink-700/70 hover:text-ink-900"
            >
              <span>{showMatched ? "▾" : "▸"}</span>
              成立済みの募集を表示（{matchedJobs.length}件）
            </button>

            {showMatched && (
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                {matchedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    footer={
                      <Button
                        as={Link}
                        href={`/store/applicants/${job.id}`}
                        variant="outline"
                        className="w-full"
                      >
                        採用した人の連絡先を見る
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
