"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  listJobs,
  createJob,
  applyToJobRemote,
  matchJobRemote,
} from "@/lib/firestoreRest";

const AppContext = createContext(null);

// 何秒おきに最新の募集一覧を取りに行くか（ミリ秒）
const POLL_INTERVAL_MS = 4000;

export function AppProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // "store" | "worker"（画面表示用のみ。認証ではない）
  const pollingRef = useRef(null);

  const refreshJobs = async () => {
    try {
      const latest = await listJobs();
      setJobs(latest);
    } catch (error) {
      console.error("募集一覧の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshJobs();
    pollingRef.current = setInterval(refreshJobs, POLL_INTERVAL_MS);
    return () => clearInterval(pollingRef.current);
  }, []);

  // 欠員募集を新規作成する
  const addJob = async (jobData) => {
    const jobId = await createJob(jobData);
    await refreshJobs();
    return jobId;
  };

  // ワーカーが募集に応募する（名前・連絡先・一言メッセージを登録）
  const applyToJob = async (jobId, applicantInfo) => {
    await applyToJobRemote(jobId, applicantInfo);
    await refreshJobs();
  };

  // 店舗が応募者を採用し、マッチングを確定する
  const matchJob = async (jobId, applicantId) => {
    await matchJobRemote(jobId, applicantId);
    await refreshJobs();
  };

  const getJob = (jobId) => jobs.find((job) => job.id === jobId);

  const getApplicantsForJob = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return [];
    return [...(job.applicants || [])].sort(
      (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt)
    );
  };

  const value = useMemo(
    () => ({ jobs, loading, role, setRole, addJob, applyToJob, matchJob, getJob, getApplicantsForJob }),
    [jobs, loading, role]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
