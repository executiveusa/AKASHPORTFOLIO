"use client";

import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fdfcfa" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: fullWidth ? 0 : "32px 40px",
          maxWidth: fullWidth ? "none" : 1080,
        }}
      >
        {children}
      </main>
    </div>
  );
}
