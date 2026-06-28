"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/lib/session-store";

export function SessionBootstrap() {
  const { loaded, loadProfile } = useSessionStore();
  useEffect(() => {
    if (!loaded) loadProfile();
  }, []);
  return null;
}
