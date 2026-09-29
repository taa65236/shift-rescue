"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ApplicantCard from "@/components/ApplicantCard";
import { useApp } from "@/context/AppContext";

export default function ApplicantsPage({ params }) {
  const { jobId } = params;
  const router = useRouter();
  const { getJob, getApplicantsForJob, matchJob } = useApp();

  const job = getJob(jobId);
  const applicants = getApplicantsForJob(jobId);

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header roleLabel="店舗モード" />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-ink-700/60">
          募集が見つかりませんでした。
        </div>
      </main>
    );
  }

  const handleHire = async (applicantId) => {
    await matchJob(job.id, applicantId);
    router.push(`/store/matched/${job.id}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="店舗モード" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          onClick={() => router.push("/store/dashboard")}
          className="mb-4 text-sm font-medium text-ink-700/70 hover:text-ink-900"
        >
          ← ダッシュボードに戻る
        </button>

        <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-ink-700/70">{job.storeName}</p>
              <h1 className="mt-0.5 font-display text-xl font-bold text-ink-900">
                {job.position}
              </h1>
            </div>
            {job.status === "matched" ? (
              <Badge tone="matched">マッチング済み</Badge>
            ) : (
              <Badge tone="urgent" pulse={job.urgent}>
                募集中
              </Badge>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-700/80">
            {job.workingHours} ・ 時給¥{Number(job.hourlyWage).toLocaleString()} ・ {job.location}
          </p>
        </div>

        <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink-900">
          応募者一覧（{applicants.length}人）
        </h2>

        {applicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white p-10 text-center text-sm text-ink-700/60">
            まだ応募者がいません。ワーカーからの応募をお待ちください。
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                isMatched={job.matchedApplicantId === applicant.id}
                onHire={handleHire}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
