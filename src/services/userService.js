import api from "./api";
import { supabase } from "../lib/supabase";

/* ============================================================
   USERS
============================================================ */

export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        uid,
        full_name,
        email,
        country,
        role,
        status,
        trade_mode,
        created_at,
        portfolio_usd,
        btc,
        eth,
        bnb,
        sol,
        xrp,
        usdt
      `
    )
    .order("uid", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data || []).map((row) => ({
      id: row.id,
      uid: row.uid,
      name: row.full_name,
      email: row.email,
      country: row.country,
      role: row.role,
      status: row.status,
      tradeMode: row.trade_mode || 'neutral', // Mapping database column to frontend prop
      createdAt: row.created_at,

      portfolio_usd: Number(row.portfolio_usd || 0),

      btc: Number(row.btc || 0),
      eth: Number(row.eth || 0),
      bnb: Number(row.bnb || 0),
      sol: Number(row.sol || 0),
      xrp: Number(row.xrp || 0),
      usdt: Number(row.usdt || 0),
    })),
  };
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    uid: data.uid,

    name: data.full_name,
    email: data.email,

    role: data.role,
    status: data.status,
    tradeMode: data.trade_mode || 'neutral', // Mapping database column to frontend prop

    country: data.country,

    portfolio_usd: Number(data.portfolio_usd || 0),

    btc: Number(data.btc || 0),
    eth: Number(data.eth || 0),
    bnb: Number(data.bnb || 0),
    sol: Number(data.sol || 0),
    xrp: Number(data.xrp || 0),
    usdt: Number(data.usdt || 0),

    createdAt: data.created_at,
    lastLogin: data.last_login,
    isOnline: data.is_online,
  };
}

/* ============================================================
   USER DETAIL
============================================================ */

export async function getUserDetail(id) {
  const profile = await getUserById(id);

  const { data: walletRows, error: walletError } = await supabase
    .from("wallet_addresses")
    .select("*")
    .eq("user_id", id);

  if (walletError) {
    throw new Error(walletError.message);
  }

  const wallets = {};

  (walletRows || []).forEach((wallet) => {
    wallets[wallet.network] = wallet.address;
  });

  return {
    ...profile,

    assets: [
      { coin: "BTC", balance: profile.btc, usdValue: 0 },
      { coin: "ETH", balance: profile.eth, usdValue: 0 },
      { coin: "BNB", balance: profile.bnb, usdValue: 0 },
      { coin: "SOL", balance: profile.sol, usdValue: 0 },
      { coin: "XRP", balance: profile.xrp, usdValue: 0 },
      { coin: "USDT", balance: profile.usdt, usdValue: profile.usdt },
    ],

    wallets,
  };
}

/* ============================================================
   USER
============================================================ */

export async function updateUser(id, payload) {
  // Support updating trade_mode via this standard function as well
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

/* ============================================================
   ⚡ NEW: ADMIN TRADE MODE TOGGLE (WIN / LOSE / NEUTRAL)
============================================================ */
export async function updateUserTradeMode(userId, newMode) {
  if (!['neutral', 'win', 'lose'].includes(newMode)) {
    throw new Error("Invalid trade mode. Must be 'neutral', 'win', or 'lose'.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ trade_mode: newMode })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    tradeMode: data.trade_mode
  };
}

export async function suspendUser(id) {
  const { data } = await api.post(`/users/${id}/suspend`);
  return data;
}

export async function activateUser(id) {
  const { data } = await api.post(`/users/${id}/activate`);
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

/* ============================================================
   SECURITY
============================================================ */

export async function resetUserPassword(id) {
  const { data } = await api.post(`/users/${id}/reset-password`);
  return data;
}

export async function suspendUserLogin(id) {
  const { data } = await api.post(`/users/${id}/suspend-login`);
  return data;
}

export async function freezeUserAccount(id) {
  const { data } = await api.post(`/users/${id}/freeze`);
  return data;
}

export async function activateUserAccount(id) {
  const { data } = await api.post(`/users/${id}/reactivate`);
  return data;
}

/* ============================================================
   ASSETS
============================================================ */

export async function updateUserAsset(
  userId,
  coin,
  balance,
  type = "adjustment",
  description = ""
) {
  const column = coin.toLowerCase();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(column)
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const before = Number(profile[column] || 0);
  const after = Number(balance);
  const change = after - before;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ [column]: after })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error: historyError } = await supabase
    .from("admin_balance_history")
    .insert({
      user_id: userId,
      admin_id: user?.id || null,
      coin,
      amount_before: before,
      amount_after: after,
      change_amount: change,
      type,
      description,
    });

  if (historyError) {
    throw new Error(historyError.message);
  }

  return { success: true };
}

/* ============================================================
   WALLETS
============================================================ */

export async function updateUserWalletAddress(userId, network, address) {
  const NETWORK_MAP = {
    bitcoin: "BTC",
    erc20: "ETH",
    trc20: "USDT",
    bep20: "USDT",
    solana: "SOL",
    xrpl: "XRP",
    dogecoin: "DOGE",
    cardano: "ADA",
    polygon: "MATIC",
    tron: "TRX",
  };

  const coin = NETWORK_MAP[network] || network.toUpperCase();

  const { data: existing, error: findError } = await supabase
    .from("wallet_addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("network", network)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (existing) {
    const { error } = await supabase
      .from("wallet_addresses")
      .update({ address })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("wallet_addresses")
      .insert({
        user_id: userId,
        coin,
        network,
        address,
        memo: null,
        status: "active",
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  return { success: true };
}

/* ============================================================
   KYC
============================================================ */

export async function approveUserKyc(id) {
  const { data } = await api.post(`/users/${id}/kyc/approve`);
  return data;
}

export async function denyUserKyc(id, reason) {
  const { data } = await api.post(`/users/${id}/kyc/deny`, { reason });
  return data;
}

/* ============================================================
   ACCOUNT BINDING
============================================================ */

export async function approveUserBinding(id) {
  const { data } = await api.post(`/users/${id}/binding/approve`);
  return data;
}

export async function denyUserBinding(id, reason) {
  const { data } = await api.post(`/users/${id}/binding/deny`, { reason });
  return data;
}

/* ============================================================
   ADMIN NOTES
============================================================ */

export async function addAdminNote(id, note) {
  const { data } = await api.post(`/users/${id}/notes`, { note });
  return data;
}

/* ============================================================
   USER ACTIVITY
============================================================ */

export async function getUserActivity(id, params = {}) {
  const { data } = await api.get(`/users/${id}/activity`, { params });
  return data;
}
