import 'dotenv/config';
import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN');
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply('♠️ PokerFace iniciado'));

bot.command('crear_partida_rapida', async (ctx) => {
  await ctx.reply('🃏 Creando partida rápida...');
});

bot.launch();

console.log('PokerFace bot running');
