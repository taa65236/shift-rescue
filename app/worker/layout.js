"use client";

import RoleGate from "@/components/RoleGate";

export default function WorkerLayout({ children }) {
  return <RoleGate role="worker">{children}</RoleGate>;
}
