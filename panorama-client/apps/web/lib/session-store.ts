import { create } from "zustand";
import { createClient } from "./supabase";

interface SessionStore {
  tenantId: string | null;
  role: string | null;
  userId: string | null;
  displayName: string | null;
  loaded: boolean;
  loadProfile: () => Promise<void>;
  clear: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  tenantId: null,
  role: null,
  userId: null,
  displayName: null,
  loaded: false,

  loadProfile: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loaded: true }); return; }

    const { data } = await supabase
      .from("user_profiles")
      .select("tenant_id, role, display_name")
      .eq("id", user.id)
      .single();

    set({
      userId: user.id,
      tenantId: data?.tenant_id ?? null,
      role: data?.role ?? null,
      displayName: data?.display_name ?? user.email ?? null,
      loaded: true,
    });
  },

  clear: () => set({ tenantId: null, role: null, userId: null, displayName: null, loaded: false }),
}));
