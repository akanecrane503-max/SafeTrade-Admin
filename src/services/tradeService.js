import { supabase } from "../lib/supabase";
import { getUserById, updateUserAsset } from "./userService";

// Trade management via Supabase.
const TRADE_SELECT_WITH_PROFILE = `
  *,
  profiles (
    full_name,
    email
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

export async function closeTrade(id) {
  const { data, error } = await supabase
    .from("trade_history")
    .update({ status: "closed" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ============================================================
   ADMIN AUTO WIN / AUTO LOSE LOGIC
============================================================ */
export async function adminForceSettleTrade(tradeId, outcome) {
  // 1. Fetch the trade
  const trade = await getTradeById(tradeId);
  if (!trade) throw new Error("Trade not found.");
  if (trade.status === "closed") throw new Error("Trade is already closed.");

  // 2. Calculate Profit/Loss
  let profitAmount = 0;
  let userBalanceUpdate = 0;
  let endingPrice = trade.entry_price; // default if needed

  // If they bet 100 USDT and win, they get 180 USDT (Stake + 80% profit) - adjust the math to your platform logic!
  const payoutMultiplier = 1.8; 

  if (outcome === 'win') {
    profitAmount = (trade.amount * payoutMultiplier) - trade.amount;
    userBalanceUpdate = trade.amount + profitAmount; // Return stake + profit
  } else if (outcome === 'lose') {
    profitAmount = -trade.amount;
    userBalanceUpdate = 0; // They lose their stake
  } else {
    throw new Error("Invalid outcome type.");
  }

  // 3. Update the User's Balance (USDT)
  // The updateUserAsset function will add/subtract the USDT safely
  await updateUserAsset(
    trade.user_id, 
    'USDT', 
    userBalanceUpdate, 
    `admin_${outcome}`, 
    `Admin Auto-${outcome.toUpperCase()} on trade ${tradeId}`
  );

  // 4. Update the Trade History Table
  const { data, error } = await supabase
    .from("trade_history")
    .update({
      status: "closed",
      outcome: outcome, // 'win' or 'lose'
      profit_amount: profitAmount,
      ending_price: endingPrice,
      closed_at: new Date().toISOString(),
    })
    .eq("id", tradeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
