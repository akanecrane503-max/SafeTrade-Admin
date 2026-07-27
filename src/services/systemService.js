import { supabase } from '../lib/supabase';

const SETTINGS_ROW_ID = 1; // single-row settings table

export async function getSystemSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || {
    registration: true,
    login: true,
    trading: true,
    deposits: true,
    withdrawals: true,
    maintenanceMode: false,
  };
}

export async function updateSystemSettings(payload) {
  const { data, error } = await supabase
    .from('system_settings')
    .update(payload)
    .eq('id', SETTINGS_ROW_ID)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getBanner() {
  const { data, error } = await supabase
    .from('system_banner')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || { text: '', enabled: false };
}

export async function updateBanner(payload) {
  const { data, error } = await supabase
    .from('system_banner')
    .update(payload)
    .eq('id', SETTINGS_ROW_ID)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getSystemAnnouncement() {
  const { data, error } = await supabase
    .from('system_announcement')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || { text: '', priority: 'normal', enabled: false };
}

export async function updateSystemAnnouncement(payload) {
  const { data, error } = await supabase
    .from('system_announcement')
    .update(payload)
    .eq('id', SETTINGS_ROW_ID)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
