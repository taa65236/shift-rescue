"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Button from "@/components/Button";
import JobCard from "@/components/JobCard";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function WorkerDashboardPage() {
  const { jobs, loading } = useApp();
  const { profile } = useAuth();

  const openJobs = jobs.filter((job) => job.status === "open");
  // すでに応募した募集のID
  const appliedIds = new Set(profile?.appliedJobIds || []);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="ワーカーモード" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">近くの募集</h1>
        <p className="mt-1 text-sm text-ink-700/70">
          今すぐ応募できる欠員募集の一覧です。緊急の募集には信号マークが表示されます。
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white p-10 text-center text-sm text-ink-700/60">
              読み込み中です…
            </div>
          ) : openJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white p-10 text-center text-sm text-ink-700/60">
              現在応募できる募集はありません。また後で確認してください。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {openJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  footer={
                    appliedIds.has(job.id) ? (
                      <Button variant="outline" className="w-full" disabled>
                        応募済み（店舗からの連絡をお待ちください）
                      </Button>
                    ) : (
                      <Button
                        as={Link}
                        href={`/worker/apply/${job.id}`}
                        variant="primary"
                        className="w-full"
                      >
                        応募する
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
