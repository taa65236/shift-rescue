"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  listJobs,
  listApplicants,
  createJob,
  applyToJobRemote,
  matchJobRemote,
  closeJobRemote,
  getUserProfile,
  updateUserFields,
} from "@/lib/firestoreRest";

const AppContext = createContext(null);

// 何秒おきに最新の募集一覧を取りに行くか（ミリ秒）
// Firestoreの無料枠（1日の読み取り5万回）を使い切らないよう、間隔をあけている。
const POLL_INTERVAL_MS = 10000;

export function AppProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  // 自分が出した募集ごとの応募者一覧 { [jobId]: [応募者, ...] }
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);
  // ログイン状態の確認が終わったかどうか（確認前に「募集なし」と出さないため）
  const authSettledRef = useRef(false);

  const refreshJobs = async () => {
    const uid = auth.currentUser?.uid;

    // 未ログインのときは、データを取りに行かない
    if (!uid) {
      if (authSettledRef.current) {
        setJobs((prev) => (prev.length ? [] : prev));
        setApplicantsByJob((prev) => (Object.keys(prev).length ? {} : prev));
        setLoading(false);
      }
      return;
    }

    try {
      const latest = await listJobs();
      setJobs(latest);

      // 応募者は「自分（店舗）が出した募集」の分だけ取りに行く。
      const myJobs = latest.filter((job) => job.ownerId === uid);
      const entries = await Promise.all(
        myJobs.map(async (job) => {
          try {
            return [job.id, await listApplicants(job.id)];
          } catch (error) {
            console.error("応募者の取得に失敗しました:", error);
            return [job.id, null];
          }
        })
      );
      setApplicantsByJob((prev) => {
        const next = {};
        for (const [jobId, list] of entries) {
          next[jobId] = list ?? prev[jobId] ?? [];
        }
        return next;
      });
    } catch (error) {
      console.error("募集一覧の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ログイン・ログアウトしたら、すぐに取り直す
    const unsubscribe = onAuthStateChanged(auth, () => {
      authSettledRef.current = true;
      refreshJobs();
    });

    // 画面を開いているときだけ、定期的に取りに行く
    pollingRef.current = setInterval(() => {
      if (!document.hidden) refreshJobs();
    }, POLL_INTERVAL_MS);

    // 別のタブから戻ってきたときも、すぐに取り直す
    const handleVisibility = () => {
      if (!document.hidden) refreshJobs();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unsubscribe();
      clearInterval(pollingRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // 欠員募集を新規作成する（作った人のuidを ownerId として保存）
  const addJob = async (jobData) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("ログインしてください。");
    const jobId = await createJob({ ...jobData, ownerId: uid });

    // 次回の入力を楽にするため、店舗名をプロフィールに覚えておく（失敗しても募集は成立）
    try {
      await updateUserFields(uid, { storeName: jobData.storeName });
    } catch (error) {
      console.error("店舗名の保存に失敗しました:", error);
    }

    await refreshJobs();
    return jobId;
  };

  // ワーカーが募集に応募する（名前・連絡先・一言メッセージを登録）
  // 店舗はワーカーのプロフィールを読めないので、飲食経験は応募データに書き写す
  const applyToJob = async (jobId, applicantInfo, foodExperience = null) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("ログインしてください。");
    await applyToJobRemote(jobId, uid, { ...applicantInfo, foodExperience });

    // 「応募済み」の表示と、次回の入力補助のために、プロフィールに記録（失敗しても応募は成立）
    try {
      const profile = await getUserProfile(uid);
      const appliedJobIds = Array.from(
        new Set([...(profile?.appliedJobIds || []), jobId])
      );
      await updateUserFields(uid, {
        appliedJobIds,
        displayName: applicantInfo.name,
        contact: applicantInfo.contact,
      });
    } catch (error) {
      console.error("応募の記録に失敗しました:", error);
    }

    await refreshJobs();
  };

  // 店舗が応募者を採用し、マッチングを確定する
  const matchJob = async (jobId, applicantId) => {
    await matchJobRemote(jobId, applicantId);
    await refreshJobs();
  };

  // 店舗が募集を取り消す（ワーカーの一覧から消え、応募できなくなる）
  const closeJob = async (jobId) => {
    await closeJobRemote(jobId);
    await refreshJobs();
  };

  // 募集に「応募人数（applicantCount）」を付けた一覧。
  // 数えられるのは自分が出した募集だけ（他店の応募者は読めないため）。
  const jobsWithCount = useMemo(
    () =>
      jobs.map((job) =>
        applicantsByJob[job.id]
          ? { ...job, applicantCount: applicantsByJob[job.id].length }
          : job
      ),
    [jobs, applicantsByJob]
  );

  const getJob = (jobId) => jobsWithCount.find((job) => job.id === jobId);

  const getApplicantsForJob = (jobId) => {
    const list = applicantsByJob[jobId] || [];
    return [...list].sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
  };

  const value = useMemo(
    () => ({
      jobs: jobsWithCount,
      loading,
      addJob,
      applyToJob,
      matchJob,
      closeJob,
      getJob,
      getApplicantsForJob,
    }),
    [jobsWithCount, applicantsByJob, loading]
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
