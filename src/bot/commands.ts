import { Context, Markup } from 'telegraf';
import { createQuickTable, setLobbyMessageId } from '../game/tables.js';
import { renderLobby } from './lobby.js';

export async function createQuickGame(ctx: Context) {
  const telegramGroupId = String(ctx.chat?.id ?? '');
  const user = ctx.from;

  if (!user || !telegramGroupId) {
    return ctx.reply('No se pudo crear la partida.');
  }

  const tableId = await createQuickTable({
    telegramGroupId,
    creatorTelegramId: String(user.id),
    username: user.username ?? user.first_name,
  });

  const message = await ctx.reply(
    renderLobby([
      {
        username: user.username ?? null,
        telegram_id: String(user.id),
      },
    ]),
    Markup.inlineKeyboard([
      Markup.button.callback('🪑 Unirse a la partida', `join:${tableId}`),
    ])
  );

  await setLobbyMessageId(tableId, message.message_id);
}
