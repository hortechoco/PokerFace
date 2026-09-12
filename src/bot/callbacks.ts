import { Context } from 'telegraf';
import { joinQuickTable } from '../game/tables.js';
import { renderLobby } from './lobby.js';

export async function joinGame(ctx: Context) {
  const callback = ctx.callbackQuery;
  if (!callback || !('data' in callback)) return;

  const [, tableId] = callback.data.split(':');
  const user = ctx.from;

  await ctx.answerCbQuery();
  if (!user) return;

  try {
    const result = await joinQuickTable({
      tableId,
      telegramId: String(user.id),
      username: user.username ?? user.first_name,
    });

    await ctx.editMessageText(
      renderLobby(result.players ?? []),
      { reply_markup: { inline_keyboard: [[{text:'🪑 Unirse a la partida', callback_data:`join:${tableId}`}]] } }
    );
  } catch {
    await ctx.reply('❌ No fue posible unirse a la mesa.');
  }
}
