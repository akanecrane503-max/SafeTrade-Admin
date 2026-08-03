import { supabase } from "../lib/supabase";

const SELECT_WITH_PROFILE = `
  *,
  profiles!withdrawal_requests_user_profile_fkey ( full_name, email, uid, account_id ),
  recipient:profiles!withdrawal_requests_recipient_profile_fkey ( full_name, email, uid, account_id )
`;

function mapWithdrawal(row) {
  if (!row) return null;
  const profile = row.profiles || {};
  const recipient = row.recipient || null;

  return {
    id: row.id,
    userId: row.user_id,
    userName: profile.full_name || "—",
    userEmail: profile.email || "—",
    amount: row.amount,
    coin: row.coin,
    method: row.type, // 'internal' | 'external'
    fee: row.fee || 0,
    network: row.network || null,
    destinationWallet:
      row.type === "internal"
        ? recipient
          ? `${recipient.full_name || "User"} (UID ${recipient.uid})`
          : row.recipient_uid
          ? `UID ${row.recipient_uid}`
          : "—"
        : row.wallet_address,
    note: row.note || null,
    status: row.status,
    reason: row.reason || null,
    createdAt: row.created_at,
    processedAt: row.processed_at,
  };
}

// params: { type?: 'internal' | 'external', status?: string, userId?: string }
export async function getWithdrawals(params = {}) {
  let query = supabase
    .from("withdrawal_requests")
    .select(SELECT_WITH_PROFILE)
    .order("created_at", { ascending: false });

  if (params.type) query = query.eq("type", params.type);
  if (params.status) query = query.eq("status", params.status);
  if (params.userId) query = query.eq("user_id", params.userId);

  const { data, error } = await query;
  if (error) throw error;

  return { items: (data || []).map(mapWithdrawal) };
}

export async function getUserWithdrawals(userId, params = {}) {
  return getWithdrawals({ ...params, userId });
}

export async function getWithdrawalById(id) {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select(SELECT_WITH_PROFILE)
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapWithdrawal(data);
}

export async function approveWithdrawal(id) {
  const { error } = await supabase.rpc("approve_withdrawal", { p_request_id: id });
  if (error) throw error;
  return { success: true };
}

export async function rejectWithdrawal(id, reason) {
  const { error } = await supabase.rpc("reject_withdrawal", {
    p_request_id: id,
    p_reason: reason || null,
  });
  if (error) throw error;
  return { success: true };
}
