import { supabase } from "../lib/supabase";

export async function getAllAccountBalances(coin) {
  const [funding, spot, futures, earn] = await Promise.all([
    supabase.rpc("get_account_balance", { p_account: "funding", p_coin: coin }),
    supabase.rpc("get_account_balance", { p_account: "spot", p_coin: coin }),
    supabase.rpc("get_account_balance", { p_account: "futures", p_coin: coin }),
    supabase.rpc("get_account_balance", { p_account: "earn", p_coin: coin }),
  ]);

  return {
    funding: funding.data || 0,
    spot: spot.data || 0,
    futures: futures.data || 0,
    earn: earn.data || 0,
  };
}

export async function transfer({ coin, fromAccount, toAccount, amount }) {
  const { data, error } = await supabase.rpc("transfer_between_accounts", {
    p_coin: coin,
    p_from_account: fromAccount,
    p_to_account: toAccount,
    p_amount: Number(amount),
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getTransferHistory(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("transfer_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}
