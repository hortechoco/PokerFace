import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Bot, webhookCallback } from "npm:grammy@1.34.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, secretKeys.default);
const bot = new Bot(token);

function lobbyText(players: Array<{ username: string | null; telegram_id: string | null; seat_number: number }>, maxPlayers: number, status: string) {
  const seats = Array.from({ length: maxPlayers }, (_, i) => {
    const player = players.find((p) => p.seat_number === i + 1);
    return `${i + 1}. ${player ? `@${player.username ?? player.telegram_id ?? "Jugador"}` : "—"}`;
  });
  const footer = status === "waiting" ? "⏳ Esperando jugadores..." : status === "running" ? "🟢 Partida iniciada" : status === "expired" ? "⌛ Mesa expirada" : "⛔ Mesa cancelada";
  return `♠️ PokerFace — Mesa rápida\n\n${seats.join("\n")}\n\n${footer}`;
}

async function getLobby(tableId: string) {
  const { data: table, error } = await supabase.from("poker_tables").select("id, telegram_group_id, telegram_message_id, status, max_players, expires_at").eq("id", tableId).maybeSingle();
  if (error) throw error;
  if (!table) throw new Error("TABLE_NOT_FOUND");
  if (table.status === "waiting" && table.expires_at && new Date(table.expires_at).getTime() <= Date.now()) {
    await supabase.from("poker_tables").update({ status: "expired" }).eq("id", tableId).eq("status", "waiting");
    table.status = "expired";
  }
  const { data: players, error: playersError } = await supabase.from("table_players").select("seat_number, players(username, telegram_id)").eq("table_id", tableId).order("seat_number", { ascending: true });
  if (playersError) throw playersError;
  return { ...table, players: (players ?? []).map((row: any) => ({ seat_number: row.seat_number, username: row.players?.username ?? null, telegram_id: row.players?.telegram_id ? String(row.players.telegram_id) : null })) };
}

async function refreshLobby(tableId: string) {
  const lobby = await getLobby(tableId);
  if (!lobby.telegram_message_id) return;
  const keyboard = lobby.status === "waiting" ? { inline_keyboard: [[{ text: "🪑 Unirse a la partida", callback_data: `join:${tableId}` }]] } : undefined;
  await bot.api.editMessageText(Number(lobby.telegram_group_id), lobby.telegram_message_id, lobbyText(lobby.players, lobby.max_players, lobby.status), keyboard ? { reply_markup: keyboard } : undefined);
}

bot.command("crear_partida_rapida", async (ctx) => {
  const user = ctx.from;
  const { data: tableId, error } = await supabase.rpc("create_quick_table", { p_telegram_group_id: String(ctx.chat.id), p_creator_telegram_id: String(user.id), p_username: user.username ?? user.first_name });
  if (error) throw error;
  const message = await ctx.reply(lobbyText([{ seat_number: 1, username: user.username ?? null, telegram_id: String(user.id) }], 8, "waiting"), { reply_markup: { inline_keyboard: [[{ text: "🪑 Unirse a la partida", callback_data: `join:${tableId}` }]] } });
  const { error: updateError } = await supabase.from("poker_tables").update({ telegram_message_id: message.message_id }).eq("id", tableId);
  if (updateError) throw updateError;
});

bot.callbackQuery(/^join:(.+)$/, async (ctx) => {
  const tableId = ctx.match[1];
  const user = ctx.from;
  try {
    const { error } = await supabase.rpc("join_quick_table", { p_table_id: tableId, p_telegram_id: String(user.id), p_username: user.username ?? user.first_name });
    if (error) {
      const code = error.message ?? "";
      const message = code.includes("PLAYER_ALREADY_IN_ACTIVE_TABLE") ? "Ya estás en una mesa activa." : code.includes("TABLE_FULL") ? "La mesa ya está llena." : code.includes("TABLE_EXPIRED") ? "Esta mesa expiró." : code.includes("TABLE_NOT_AVAILABLE") ? "La mesa ya no está disponible." : "No fue posible unirse a la mesa.";
      await ctx.answerCallbackQuery(`❌ ${message}`, { show_alert: true });
      await refreshLobby(tableId);
      return;
    }
    await ctx.answerCallbackQuery("Te uniste a la mesa.");
    await refreshLobby(tableId);
  } catch (error) {
    console.error(error);
    try { await ctx.answerCallbackQuery("No fue posible procesar la acción.", { show_alert: true }); } catch {}
  }
});

const handleUpdate = webhookCallback(bot, "std/http");
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });
  try { return await handleUpdate(req); } catch (error) { console.error(error); return new Response("error", { status: 500 }); }
});
