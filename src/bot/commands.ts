import { Context } from 'telegraf';

export async function createQuickGame(ctx: Context) {
  await ctx.reply('🃏 Creando partida rápida de Hold\'em...');
}
