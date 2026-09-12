import { Context } from 'telegraf';
import { joinQuickTable } from '../game/tables.js';

export async function joinGame(ctx: Context) {
  const callback = ctx.callbackQuery;
  if (!callback || !('data' in callback)) return;

  const [, tableId] = callback.data.split(':');
  const user = ctx.from;

  await ctx.answerCbQuery();

  if (!user) return;

  try {
    await joinQuickTable({
      tableId,
      telegramId: String(user.id),
      username: user.username ?? user.first_name,
    });

    await ctx.reply('✅ Te uniste a la mesa.');
  } catch (e) {
    await ctx.reply('❌ No fue posible unirse a la mesa.');
  }
}
