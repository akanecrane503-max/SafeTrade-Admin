export async function updateUserAsset(
  userId,
  coin,
  balance,
  type = "adjustment",
  description = ""
) {
  const column = coin.toLowerCase();

  const allowedColumns = [
    "btc",
    "eth",
    "bnb",
    "sol",
    "xrp",
    "usdt",
  ];

  if (!allowedColumns.includes(column)) {
    throw new Error(`Unsupported asset: ${coin}`);
  }

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
    .update({
      [column]: after,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return {
    success: true,
  };
}
