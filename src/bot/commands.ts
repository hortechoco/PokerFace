import { Context, Markup } from 'telegraf';
import { createQuickTable } from '../game/tables.js';

export async function createQuickGame(ctx: Context) {
  const telegramGroupId = String(ctx.chat?.id ?? '');
  const user = ctx.from;

  if (!user || !telegramGroupId) {
    return ctx.reply('No se pudo crear la partida.');
  }

  const table = await createQuickTable({
    telegramGroupId,
    creatorTelegramId: String(user.id),
    username: user.username ?? user.first_name,
  });

  await ctx.reply(
    `🤠 Mesa Hold'em creada\n\n1. @${user.username ?? user.first_name}\n\nEsperando jugadores...\nMesa: ${table.id}`,
    Markup.inlineKeyboard([
      Markup.button.callback('🪑 Unirse a la partida', `join:${table.id}`),
    ])
  );
}
