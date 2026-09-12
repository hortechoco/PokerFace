import { Context } from 'telegraf';

export async function joinGame(ctx: Context) {
  const callback = ctx.callbackQuery;
  if (!callback || !('data' in callback)) return;

  const [, tableId] = callback.data.split(':');

  await ctx.answerCbQuery();
  await ctx.reply(`🪑 Solicitud para unirse a mesa ${tableId} recibida.`);
}
