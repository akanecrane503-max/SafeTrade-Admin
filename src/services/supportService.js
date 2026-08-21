import { supabase } from "../lib/supabase";

// archived: false -> active conversations, true -> archived conversations
export async function getChats(archived = false) {
  let query = supabase
    .from("support_chats")
    .select("*")
    .order("last_message_at", { ascending: false });
  query = archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  const { data, error } = await query;
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
    .insert({ chat_id: chatId, sender_type: "admin", sender_id: adminId, message, message_type: "text" });
  if (msgError) throw new Error(msgError.message);
  await supabase
    .from("support_chats")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", chatId);
}

export async function sendOptionsMessage(chatId, adminId, prompt, options) {
  const { error: msgError } = await supabase
    .from("support_messages")
    .insert({
      chat_id: chatId,
      sender_type: "admin",
      sender_id: adminId,
      message: prompt,
      message_type: "options",
      options,
    });
  if (msgError) throw new Error(msgError.message);
  await supabase
    .from("support_chats")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", chatId);
}

// ── Images ──

export async function uploadChatImage(file) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("chat-images")
    .upload(path, file);
  if (uploadError) throw new Error(uploadError.message);
  const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function sendImageMessage(chatId, adminId, imageUrl) {
  const { error: msgError } = await supabase
    .from("support_messages")
    .insert({
      chat_id: chatId,
      sender_type: "admin",
      sender_id: adminId,
      message: imageUrl,
      message_type: "image",
    });
  if (msgError) throw new Error(msgError.message);
  await supabase
    .from("support_chats")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", chatId);
}

export async function deleteMessage(messageId) {
  const { error } = await supabase.from("support_messages").delete().eq("id", messageId);
  if (error) throw new Error(error.message);
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

// ── Pinning ──

export async function pinMessage(messageId, pinned) {
  const { error } = await supabase
    .from("support_messages")
    .update({ pinned })
    .eq("id", messageId);
  if (error) throw new Error(error.message);
}

// ── Archive / Delete conversation ──
// Archiving only hides a conversation from the active list — full history stays intact.
// Deleting is permanent: it removes the chat's messages and the chat row itself.

export async function archiveChat(chatId) {
  const { error } = await supabase
    .from("support_chats")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", chatId);
  if (error) throw new Error(error.message);
}

export async function unarchiveChat(chatId) {
  const { error } = await supabase
    .from("support_chats")
    .update({ archived_at: null })
    .eq("id", chatId);
  if (error) throw new Error(error.message);
}

export async function deleteChat(chatId) {
  const { error: msgError } = await supabase
    .from("support_messages")
    .delete()
    .eq("chat_id", chatId);
  if (msgError) throw new Error(msgError.message);
  const { error } = await supabase.from("support_chats").delete().eq("id", chatId);
  if (error) throw new Error(error.message);
}

// ── Templates: quick replies + reusable option sets ──

export async function getTemplates(kind) {
  const { data, error } = await supabase
    .from("support_templates")
    .select("*")
    .eq("kind", kind)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTemplate(payload) {
  const { data, error } = await supabase
    .from("support_templates")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTemplate(id, payload) {
  const { data, error } = await supabase
    .from("support_templates")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from("support_templates").delete().eq("id", id);
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

// Live updates for chat rows themselves (online/offline, left_at, archived_at, etc.)
// so the sidebar and header refresh without needing a manual reload.
export function subscribeToChatStatus(onUpdate) {
  const channel = supabase
    .channel("support-chats-status")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "support_chats" },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
