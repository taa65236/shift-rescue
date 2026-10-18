"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function dashboardPath(role) {
  return role === "store" ? "/store/dashboard" : "/worker/dashboard";
}

export default function RoleGate({ role, children }) {
  const router = useRouter();
  const { user, authReady, profile, profileReady } = useAuth();

  useEffect(() => {
    if (!authReady || !profileReady) return;
    if (!user || !profile) {
      router.replace("/");
      return;
    }
    if (profile.role !== role) {
      router.replace(dashboardPath(profile.role));
    }
  }, [authReady, profileReady, user, profile, role, router]);

  if (!authReady || !profileReady || !user || !profile || profile.role !== role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-ink-700/60">読み込み中です…</p>
      </main>
    );
  }

  return children;
}
