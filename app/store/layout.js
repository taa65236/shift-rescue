"use client";

import RoleGate from "@/components/RoleGate";

export default function StoreLayout({ children }) {
  return <RoleGate role="store">{children}</RoleGate>;
}
