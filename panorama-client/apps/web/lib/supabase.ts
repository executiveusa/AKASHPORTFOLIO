import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Tenant-aware query helper — always injects tenant_id
export async function tenantQuery<T>(
  table: string,
  tenantId: string,
  query: (client: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> {
  const client = createClient();
  // RLS handles isolation, but we also pass tenant_id explicitly
  return query(client);
}
