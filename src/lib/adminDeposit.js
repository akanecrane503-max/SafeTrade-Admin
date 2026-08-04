import { supabase } from "./supabase";

/**
 * Admin function to add a deposit to a user's account
 * @param {string} userEmail - The user's email
 * @param {string} coin - The coin symbol (e.g., "BTC", "USDT")
 * @param {string} network - The network name (e.g., "TRC20", "ERC20")
 * @param {number} amount - The amount to deposit
 * @param {string} status - "Completed", "Pending", or "Failed"
 * @param {string} txHash - Optional transaction hash
 * @param {string} depositAddress - Optional deposit address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addDepositToUser(userEmail, coin, network, amount, status = 'Completed', txHash = null, depositAddress = null) {
  try {
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    const userId = userData.id;

    // Insert deposit into deposit_history
    const { data, error } = await supabase
      .from('deposit_history')
      .insert({
        user_id: userId,
        user_email: userEmail,
        coin: coin,
        network: network,
        amount: amount,
        status: status,
        tx_hash: txHash,
        deposit_address: depositAddress,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding deposit:', error);
      return { success: false, error: error.message };
    }

    // If deposit is completed, update the user's balance
    if (status === 'Completed') {
      const coinField = coin.toLowerCase();
      
      // Get current profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { success: false, error: 'Failed to update balance' };
      }

      // Update balance
      const currentBalance = profile[coinField] || 0;
      const newBalance = currentBalance + amount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [coinField]: newBalance })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        return { success: false, error: 'Failed to update balance' };
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}
