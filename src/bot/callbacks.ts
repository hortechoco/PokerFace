import { Context, Markup } from 'telegraf';
import { getQuickLobby, joinQuickTable } from '../game/tables.js';
import { renderLobby } from './lobby.js';

function errorCode(error: unknown) {
  return error && typeof error === 'object' && 'message' in error
    ? String((error as { message: string }).message)
    : '';
}

export async function joinGame(ctx: Context) {
  const callback = ctx.callbackQuery;
  if (!callback || !('data' in callback)) return;

  const [, tableId] = callback.data.split(':');
  const user = ctx.from;

  await ctx.answerCbQuery();
  if (!user || !tableId) return;

  try {
    await joinQuickTable({
      tableId,
      telegramId: String(user.id),
      username: user.username ?? user.first_name,
    });
  } catch (error) {
    const code = errorCode(error);
    const message =
      code.includes('PLAYER_ALREADY_IN_ACTIVE_TABLE') ? 'Ya estás en una mesa activa.' :
      code.includes('TABLE_FULL') ? 'La mesa ya está llena.' :
      code.includes('TABLE_EXPIRED') ? 'Esta mesa expiró.' :
      code.includes('TABLE_NOT_AVAILABLE') ? 'La mesa ya no está disponible.' :
      'No fue posible unirse a la mesa.';

    await ctx.reply(`❌ ${message}`);
  }

  try {
    const lobby = await getQuickLobby(tableId);
    if (!lobby.telegram_message_id) return;

    const keyboard = lobby.status === 'waiting'
      ? Markup.inlineKeyboard([
          Markup.button.callback('🪑 Unirse a la partida', `join:${tableId}`),
        ]).reply_markup
      : undefined;

    await ctx.telegram.editMessageText(
      Number(lobby.telegram_group_id),
      lobby.telegram_message_id,
      undefined,
      renderLobby(lobby.players, lobby.max_players, lobby.status),
      keyboard ? { reply_markup: keyboard } : undefined,
    );
  } catch {
    // The original Telegram message may have been deleted or become uneditable.
  }
}
