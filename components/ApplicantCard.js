"use client";

import Button from "@/components/Button";
import { formatRelativeTime } from "@/lib/time";

export default function ApplicantCard({ applicant, isMatched, onHire }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-5 shadow-card sm:flex-row sm:items-start sm:justify-between ${
        isMatched ? "border-rescue-400 bg-rescue-50/40" : "border-ink-900/10 bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-lg font-semibold text-white">
          {applicant.name.slice(0, 1)}
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink-900">{applicant.name}</p>
          <p className="mt-0.5 text-sm text-ink-700/80">連絡先：{applicant.contact}</p>
          {applicant.message && (
            <p className="mt-1 max-w-sm text-sm text-ink-700/70">「{applicant.message}」</p>
          )}
          <p className="mt-1 text-xs text-ink-700/50">{formatRelativeTime(applicant.appliedAt)}に応募</p>
        </div>
      </div>

      {isMatched ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rescue-500 px-5 py-3 text-sm font-semibold text-white">
          採用済み
        </span>
      ) : (
        <Button variant="success" className="shrink-0" onClick={() => onHire(applicant.id)}>
          採用する
        </Button>
      )}
    </div>
  );
}
