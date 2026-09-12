import { supabase } from '../supabase/client.js';

export const MAX_PLAYERS = 8;
export const STARTING_CHIPS = 1000;

export type TableStatus = 'waiting' | 'running' | 'finished' | 'cancelled';

export async function createQuickTable(input: {
  telegramGroupId: string;
  creatorTelegramId: string;
  username: string;
}) {
  const { data: table, error } = await supabase
    .from('poker_tables')
    .insert({
      telegram_group_id: input.telegramGroupId,
      status: 'waiting',
      max_players: MAX_PLAYERS,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('table_players').insert({
    table_id: table.id,
    telegram_id: input.creatorTelegramId,
    starting_chips: STARTING_CHIPS,
    chips_current: STARTING_CHIPS,
    seat_number: 1,
  });

  return table;
}
