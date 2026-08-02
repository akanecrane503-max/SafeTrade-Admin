import { supabase } from "../lib/supabase";

// Per-user trading status control.
// This is separate from the platform-wide toggle in systemService.js.
export async function toggleUserTrading(userId, enabled) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      trading_enabled: enabled,
    })
    .eq("id", userId)
    .select("id, trading_enabled")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserTrades(userId, params = {}) {
  const {
    page = 1,
    limit = 50,
    status,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("trade_history")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: data || [],
    total: count || 0,
  };
}
