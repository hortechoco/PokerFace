import { supabase } from '../supabase/client.js';

export const MAX_PLAYERS = 8;
export const STARTING_CHIPS = 1000;

export async function createQuickTable(input: {
  telegramGroupId: string;
  creatorTelegramId: string;
  username: string;
}) {
  const { data, error } = await supabase.rpc('create_quick_table', {
    p_telegram_group_id: input.telegramGroupId,
    p_creator_telegram_id: input.creatorTelegramId,
    p_username: input.username,
  });

  if (error) throw error;
  return data;
}

export async function joinQuickTable(input: {
  tableId: string;
  telegramId: string;
  username: string;
}) {
  const { data, error } = await supabase.rpc('join_quick_table', {
    p_table_id: input.tableId,
    p_telegram_id: input.telegramId,
    p_username: input.username,
  });

  if (error) throw error;
  return data;
}
