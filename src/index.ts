import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { createQuickGame } from './bot/commands.js';
import { joinGame } from './bot/callbacks.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply('♠️ PokerFace iniciado'));
bot.command('crear_partida_rapida', createQuickGame);
bot.on('callback_query', joinGame);

bot.launch();
console.log('PokerFace bot running');
