"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import JobCard from "@/components/JobCard";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { getJobRemote } from "@/lib/firestoreRest";
import { LINE_COMMUNITY_URL } from "@/lib/line";

// 応募した募集の状態を、ワーカー向けの表示にする（job が null なら削除済み）
function applicationResult(job, uid) {
  if (!job || job.status === "closed") {
    return { label: "募集が終了しました", tone: "neutral", dim: true };
  }
  if (job.status === "matched") {
    return job.matchedApplicantId === uid
      ? { label: "採用されました。店舗から連絡が来ます", tone: "matched", dim: false }
      : { label: "今回は見送りになりました", tone: "neutral", dim: true };
  }
  return { label: "応募中", tone: "open", dim: false };
}

export default function WorkerDashboardPage() {
  const { jobs, loading } = useApp();
  const { user, profile } = useAuth();

  const openJobs = jobs.filter((job) => job.status === "open");
  // すでに応募した募集のID
  const appliedJobIds = profile?.appliedJobIds || [];
  const appliedIds = new Set(appliedJobIds);

  // 募集一覧（jobs）には募集中と自分の募集しか入らないので、
  // 成立・終了して一覧から消えた応募先は、IDを指定して個別に取りに行く。
  // { [jobId]: 募集 | null（削除済み） }
  const [fetchedJobs, setFetchedJobs] = useState({});
  const fetchingRef = useRef(new Set());
  const appliedKey = appliedJobIds.join(",");

  useEffect(() => {
    if (loading) return;
    const listedIds = new Set(jobs.map((job) => job.id));
    const targets = appliedJobIds.filter((id) => {
      if (listedIds.has(id) || fetchingRef.current.has(id)) return false;
      // 成立・終了・削除済みは状態が変わらないので、取り直さない
      return !(id in fetchedJobs) || fetchedJobs[id]?.status === "open";
    });
    for (const id of targets) {
      fetchingRef.current.add(id);
      getJobRemote(id)
        .then((job) => setFetchedJobs((prev) => ({ ...prev, [id]: job })))
        .catch((error) => console.error("応募先の募集の取得に失敗しました:", error))
        .finally(() => fetchingRef.current.delete(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, jobs, appliedKey]);

  // 新しく応募したものを上にする。まだ取得できていない募集は出さない
  const applications = [...appliedJobIds]
    .reverse()
    .map((id) => {
      const listed = jobs.find((job) => job.id === id);
      if (listed) return { id, job: listed };
      if (id in fetchedJobs) return { id, job: fetchedJobs[id] };
      return null;
    })
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="ワーカーモード" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {appliedJobIds.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold text-ink-900">応募の結果</h2>
            {applications.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-ink-900/15 bg-white p-6 text-center text-sm text-ink-700/60">
                読み込み中です…
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-900/10 rounded-2xl border border-ink-900/10 bg-white shadow-card">
                {applications.map(({ id, job }) => {
                  const result = applicationResult(job, user?.uid);
                  return (
                    <li
                      key={id}
                      className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                        result.dim ? "opacity-60" : ""
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-ink-700/70">
                          {job?.storeName || "削除された募集"}
                        </p>
                        {job && (
                          <p className="text-sm font-semibold text-ink-900">
                            {job.position}
                            <span className="ml-2 font-normal text-ink-700/70">
                              {job.workingHours}
                            </span>
                          </p>
                        )}
                      </div>
                      <Badge tone={result.tone} className="shrink-0 self-start sm:self-auto">
                        {result.label}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <h1 className="font-display text-2xl font-bold text-ink-900">近くの募集</h1>
        <p className="mt-1 text-sm text-ink-700/70">
          今すぐ応募できる欠員募集の一覧です。緊急の募集には信号マークが表示されます。
        </p>

        {LINE_COMMUNITY_URL && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-rescue-400/50 bg-rescue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-800">
              新しい募集が出たら、LINEで知らせます。オープンチャットに参加しておくと、
              急な募集を見逃しません。
            </p>
            <Button
              as="a"
              href={LINE_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="success"
              className="shrink-0"
            >
              LINEで通知を受け取る
            </Button>
          </div>
        )}

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
