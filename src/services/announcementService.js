import { supabase } from "../lib/supabase";

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return {
    items: (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      priority: row.priority,
      audience: row.audience,
      targetUid: row.target_uid,
      published: row.published,
      createdAt: row.created_at,
    })),
  };
}

export async function createAnnouncement(payload) {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      audience: payload.audience,
      target_uid: payload.audience === "specific_uid" ? payload.targetUid : null,
      published: payload.published,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (payload.published) {
    await supabase.rpc("fan_out_announcement", { p_announcement_id: data.id });
  }
  return data;
}

export async function updateAnnouncement(id, payload) {
  const { data, error } = await supabase
    .from("announcements")
    .update({
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      audience: payload.audience,
      target_uid: payload.audience === "specific_uid" ? payload.targetUid : null,
      published: payload.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (payload.published) {
    await supabase.rpc("fan_out_announcement", { p_announcement_id: id });
  }
  return data;
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function togglePublish(id, published) {
  const { error } = await supabase
    .from("announcements")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (published) {
    await supabase.rpc("fan_out_announcement", { p_announcement_id: id });
  }
  return { success: true };
}
