"use client";

const VARIANTS = {
  primary:
    "bg-flare-500 text-white hover:bg-flare-600 focus-visible:ring-flare-500 shadow-card",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-700 shadow-card",
  success:
    "bg-rescue-500 text-white hover:bg-rescue-600 focus-visible:ring-rescue-500 shadow-card",
  outline:
    "bg-white text-ink-900 border border-ink-900/15 hover:border-ink-900/30 focus-visible:ring-ink-700",
  ghost:
    "bg-transparent text-ink-900 hover:bg-ink-900/5 focus-visible:ring-ink-700",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  as: Component = "button",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
