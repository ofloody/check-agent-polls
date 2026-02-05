import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (client) return client;
  const res = await fetch("/api/config");
  const { supabaseUrl, supabaseAnonKey } = await res.json();
  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
