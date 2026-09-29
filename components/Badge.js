"use client";

const STYLES = {
  urgent: "bg-flare-50 text-flare-700",
  open: "bg-ink-900/5 text-ink-800",
  matched: "bg-rescue-50 text-rescue-700",
  neutral: "bg-ink-900/5 text-ink-700",
};

export default function Badge({ children, tone = "neutral", className = "", pulse = false }) {
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STYLES[tone]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-signal-ping rounded-full bg-flare-500" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-flare-500" />
        </span>
      )}
      {children}
    </span>
  );
}
