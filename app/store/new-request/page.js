"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const FIELD_CLASS =
  "w-full rounded-xl border border-ink-900/15 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-flare-500 focus:outline-none focus:ring-2 focus:ring-flare-500/30";

const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-ink-900";

export default function NewRequestPage() {
  const router = useRouter();
  const { addJob } = useApp();
  const { profile, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    storeName: "",
    position: "",
    workingHours: "",
    hourlyWage: "",
    location: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 前回の募集で使った店舗名を、最初から入れておく（まだ入力していないときだけ）
  useEffect(() => {
    if (!profile?.storeName) return;
    setForm((prev) => ({ ...prev, storeName: prev.storeName || profile.storeName }));
  }, [profile]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await addJob({
        storeName: form.storeName || "店舗名未設定",
        position: form.position || "職種未設定",
        workingHours: form.workingHours || "未設定",
        hourlyWage: Number(form.hourlyWage) || 0,
        location: form.location || "未設定",
        description: form.description || "詳細は追ってお知らせします。",
      });
      await refreshProfile();
      router.push("/store/dashboard");
    } catch (err) {
      setError(err.message || "募集の作成に失敗しました。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header roleLabel="店舗モード" />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">欠員募集を作成</h1>
        <p className="mt-1 text-sm text-ink-700/70">
          必要な情報を入力して募集を開始すると、条件に合うワーカーへリアルタイムで通知されます。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card sm:p-8"
        >
          <div>
            <label className={LABEL_CLASS}>店舗名</label>
            <input
              required
              className={FIELD_CLASS}
              placeholder="例：カフェ・ソレイユ 新宿店"
              value={form.storeName}
              onChange={update("storeName")}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>職種</label>
              <input
                required
                className={FIELD_CLASS}
                placeholder="例：ホールスタッフ"
                value={form.position}
                onChange={update("position")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>勤務時間</label>
              <input
                required
                className={FIELD_CLASS}
                placeholder="例：17:00〜22:00"
                value={form.workingHours}
                onChange={update("workingHours")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>時給（円）</label>
              <input
                required
                type="number"
                min="0"
                className={FIELD_CLASS}
                placeholder="例：1200"
                value={form.hourlyWage}
                onChange={update("hourlyWage")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>勤務地</label>
              <input
                required
                className={FIELD_CLASS}
                placeholder="例：東京都新宿区"
                value={form.location}
                onChange={update("location")}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>仕事内容</label>
            <textarea
              required
              rows={4}
              className={FIELD_CLASS}
              placeholder="欠員の状況や、お願いしたい業務内容を入力してください"
              value={form.description}
              onChange={update("description")}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/store/dashboard")}
            >
              キャンセル
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "送信中…" : "この内容で募集を開始する"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
