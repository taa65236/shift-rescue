"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { foodExperienceLabel } from "@/lib/foodExperience";

const FIELD_CLASS =
  "w-full rounded-xl border border-ink-900/15 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-flare-500 focus:outline-none focus:ring-2 focus:ring-flare-500/30";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-ink-900";

export default function ApplyPage({ params }) {
  const { jobId } = params;
  const router = useRouter();
  const { getJob, applyToJob } = useApp();
  const { profile, refreshProfile } = useAuth();
  const job = getJob(jobId);

  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const alreadyApplied = (profile?.appliedJobIds || []).includes(jobId);

  // 前回応募したときの名前と連絡先を、最初から入れておく（まだ何も入力していない項目だけ）
  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || profile.displayName || "",
      contact: prev.contact || profile.contact || "",
    }));
  }, [profile]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await applyToJob(jobId, form, profile?.foodExperience || null);
      await refreshProfile();
      router.push("/worker/complete");
    } catch (err) {
      setError(err.message || "応募に失敗しました。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header roleLabel="ワーカーモード" />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-ink-700/60">
          募集が見つかりませんでした。すでに他の人が採用された可能性があります。
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="ワーカーモード" />

      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <button
          onClick={() => router.push("/worker/dashboard")}
          className="mb-4 text-sm font-medium text-ink-700/70 hover:text-ink-900"
        >
          ← 募集一覧に戻る
        </button>

        <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-card">
          <p className="text-xs font-medium text-ink-700/70">{job.storeName}</p>
          <h1 className="mt-0.5 font-display text-lg font-bold text-ink-900">{job.position}</h1>
          <p className="mt-2 text-sm text-ink-700/80">
            {job.workingHours} ・ 時給¥{Number(job.hourlyWage).toLocaleString()} ・ {job.location}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card sm:p-8"
        >
          <p className="text-sm text-ink-700/70">
            応募には、店舗から連絡が取れる情報が必要です。電話番号やLINE
            IDなど、確実に連絡が取れるものを入力してください。
          </p>

          {alreadyApplied && (
            <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
              この募集には、すでに応募しています。店舗からの連絡をお待ちください。
            </p>
          )}

          <div className="rounded-xl bg-ink-900/5 px-4 py-2.5 text-sm text-ink-800">
            登録した飲食経験：
            <span className="font-semibold">{foodExperienceLabel(profile?.foodExperience)}</span>
            <span className="mt-0.5 block text-xs text-ink-700/60">
              経験の年数や内容は、下の「一言メッセージ」に書いてください。
            </span>
          </div>

          <div>
            <label className={LABEL_CLASS}>お名前</label>
            <input
              required
              className={FIELD_CLASS}
              placeholder="例：山田 太郎"
              value={form.name}
              onChange={update("name")}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>連絡先（電話番号・LINE IDなど）</label>
            <input
              required
              className={FIELD_CLASS}
              placeholder="例：090-1234-5678"
              value={form.contact}
              onChange={update("contact")}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>一言メッセージ（任意）</label>
            <textarea
              rows={3}
              className={FIELD_CLASS}
              placeholder="例：本日18時から伺えます。接客経験2年あります。"
              value={form.message}
              onChange={update("message")}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting || alreadyApplied}
          >
            {alreadyApplied ? "応募済みです" : submitting ? "送信中…" : "この内容で応募する"}
          </Button>
        </form>
      </div>
    </main>
  );
}
