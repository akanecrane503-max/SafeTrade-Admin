import { supabase } from "../lib/supabase";

export async function getChats() {
  const { data, error } = await supabase
    .from("support_chats")
    .select("*")
    .order("last_message_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getUnreadCount() {
  const { count, error } = await supabase
    .from("support_messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_type", "user")
    .eq("read_by_admin", false);
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function getMessages(chatId) {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function sendMessage(chatId, adminId, message) {
  const { error: msgError } = await supabase
    .from("support_messages")
    .insert({ chat_id: chatId, sender_type: "admin", sender_id: adminId, message });
  if (msgError) throw new Error(msgError.message);

  await supabase
    .from("support_chats")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", chatId);
}

export async function markChatRead(chatId) {
  const { error } = await supabase
    .from("support_messages")
    .update({ read_by_admin: true })
    .eq("chat_id", chatId)
    .eq("sender_type", "user")
    .eq("read_by_admin", false);
  if (error) throw new Error(error.message);
}

export function subscribeToAllMessages(onInsert) {
  const channel = supabase
    .channel("support-messages-global")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "support_messages" },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToChat(chatId, onInsert) {
  const channel = supabase
    .channel(`admin-chat-${chatId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "support_messages", filter: `chat_id=eq.${chatId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
