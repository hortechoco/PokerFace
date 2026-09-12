export function renderLobby(players: Array<{username?: string, telegram_id?: string}>, max = 8) {
  const rows = Array.from({length:max}, (_,i) => {
    const p = players[i];
    return `${i+1}. ${p ? '@'+(p.username ?? p.telegram_id) : '-'}`;
  }).join('\n');

  return `🤠 PokerFace - Mesa rápida\n\n🪑 Jugadores (${players.length}/${max})\n\n${rows}\n\n⏳ Esperando jugadores...`;
}
