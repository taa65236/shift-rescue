"use client";

import Link from "next/link";

export default function Header({ roleLabel, homeHref = "/" }) {
  return (
    <header className="sticky top-0 z-10 border-b border-ink-900/10 bg-ink-950 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flare-500 font-display text-base font-bold">
            SR
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Shift Rescue
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {roleLabel && (
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 sm:inline-block">
              {roleLabel}
            </span>
          )}
          <Link
            href={homeHref}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ログアウト
          </Link>
        </div>
      </div>
    </header>
  );
}
