import { supabase } from "../lib/supabase";
// Trade management via Supabase.
// getTrades() keeps the existing response shape: { items: [], total: number }.
const TRADE_SELECT_WITH_PROFILE = `
  *,
  profiles (
    full_name,
    email
  )
`;
async function runTradeQuery(queryFactory) {
  let result = await queryFactory(TRADE_SELECT_WITH_PROFILE);
  // Supports schemas where trade_history has no detectable FK to profiles.
  if (result.error) {
    result = await queryFactory("*");
  }
  if (result.error) {
    throw result.error;
  }
  return result;
}
export async function getTrades(params = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    userId,
    symbol,
  } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count } = await runTradeQuery((select) => {
    let query = supabase
      .from("trade_history")
      .select(select, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (status) query = query.eq("status", status);
    if (userId) query = query.eq("user_id", userId);
    if (symbol) query = query.ilike("symbol", `%${symbol}%`);
    return query;
  });
  return {
    items: data || [],
    total: count || 0,
  };
}
export async function getTradeById(id) {
  const { data } = await runTradeQuery((select) =>
    supabase
      .from("trade_history")
      .select(select)
      .eq("id", id)
      .single()
  );
  return data;
}
export async function getRecentTrades(limit = 5) {
  const { data } = await runTradeQuery((select) =>
    supabase
      .from("trade_history")
      .select(select)
      .order("created_at", { ascending: false })
      .limit(limit)
  );
  return data || [];
}
export async function createTrade(tradePayload) {
  // The SafeTradex TradingModal payload is inserted directly.
  // It must use the same column names as public.trade_history.
  const { data, error } = await supabase
    .from("trade_history")
    .insert([
      {
        ...tradePayload,
        status: tradePayload.status || "open",
      },
    ])
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function closeTrade(id) {
  const { data, error } = await supabase
    .from("trade_history")
    .update({ status: "closed" })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
