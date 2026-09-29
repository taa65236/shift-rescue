"use client";

import Badge from "@/components/Badge";
import { formatRelativeTime } from "@/lib/time";

export default function JobCard({ job, footer }) {
  const isMatched = job.status === "matched";
  const applicantCount = (job.applicants || []).length;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-900/10 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-ink-700/70">{job.storeName}</p>
          <h3 className="mt-0.5 font-display text-lg font-semibold text-ink-900">
            {job.position}
          </h3>
        </div>
        {isMatched ? (
          <Badge tone="matched">マッチング済み</Badge>
        ) : job.urgent ? (
          <Badge tone="urgent" pulse>
            緊急
          </Badge>
        ) : (
          <Badge tone="open">募集中</Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-ink-700">
        <div>
          <dt className="text-xs text-ink-700/60">勤務時間</dt>
          <dd className="font-medium text-ink-900">{job.workingHours}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">時給</dt>
          <dd className="font-medium text-ink-900">¥{Number(job.hourlyWage).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">勤務地</dt>
          <dd className="font-medium text-ink-900">{job.location}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">投稿</dt>
          <dd className="font-medium text-ink-900">{formatRelativeTime(job.createdAt)}</dd>
        </div>
      </dl>

      <p className="line-clamp-2 text-sm text-ink-700/80">{job.description}</p>

      {!isMatched && applicantCount > 0 && (
        <p className="text-xs font-medium text-flare-600">現在 {applicantCount}人が応募中</p>
      )}

      {footer && <div className="pt-1">{footer}</div>}
    </div>
  );
}
