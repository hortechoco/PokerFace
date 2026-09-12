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
    `🤠 PokerFace - Mesa rápida\n\n🪑 Jugadores (1/8)\n\n1. @${user.username ?? user.first_name}\n2. -\n3. -\n4. -\n5. -\n6. -\n7. -\n8. -`,
    Markup.inlineKeyboard([
      Markup.button.callback('🪑 Unirse a la partida', `join:${table.id}`),
    ])
  );
}
