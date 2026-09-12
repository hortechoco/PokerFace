import { supabase } from '../supabase/client.js';

export const MAX_PLAYERS = 8;
export const STARTING_CHIPS = 1000;

type LobbyRow = {
  table_id: string;
  telegram_group_id: string;
  telegram_message_id: number | null;
  status: 'waiting' | 'running' | 'expired' | 'cancelled';
  max_players: number;
  expires_at: string | null;
  players: Array<{ username: string | null; telegram_id: string | null; seat_number: number }>;
};

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
  return data as string;
}

export async function setLobbyMessageId(tableId: string, messageId: number) {
  const { error } = await supabase
    .from('poker_tables')
    .update({ telegram_message_id: messageId })
    .eq('id', tableId);

  if (error) throw error;
}

export async function getQuickLobby(tableId: string): Promise<LobbyRow> {
  const { data: table, error: tableError } = await supabase
    .from('poker_tables')
    .select('id, telegram_group_id, telegram_message_id, status, max_players, expires_at')
    .eq('id', tableId)
    .maybeSingle();

  if (tableError) throw tableError;
  if (!table) throw new Error('TABLE_NOT_FOUND');

  if (table.status === 'waiting' && table.expires_at && new Date(table.expires_at).getTime() <= Date.now()) {
    await supabase.from('poker_tables').update({ status: 'expired' }).eq('id', tableId).eq('status', 'waiting');
    table.status = 'expired';
  }

  const { data: players, error: playersError } = await supabase
    .from('table_players')
    .select('seat_number, players(username, telegram_id)')
    .eq('table_id', tableId)
    .order('seat_number', { ascending: true });

  if (playersError) throw playersError;

  return {
    table_id: table.id,
    telegram_group_id: String(table.telegram_group_id),
    telegram_message_id: table.telegram_message_id,
    status: table.status,
    max_players: table.max_players,
    expires_at: table.expires_at,
    players: (players ?? []).map((row: any) => ({
      seat_number: row.seat_number,
      username: row.players?.username ?? null,
      telegram_id: row.players?.telegram_id ? String(row.players.telegram_id) : null,
    })),
  };
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
  return data?.[0] ?? data;
}
