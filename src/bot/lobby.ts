type LobbyPlayer = { username?: string | null; telegram_id?: string | null };

type LobbyStatus = 'waiting' | 'running' | 'expired' | 'cancelled';

export function renderLobby(
  players: LobbyPlayer[],
  max = 8,
  status: LobbyStatus = 'waiting',
) {
  const rows = Array.from({ length: max }, (_, i) => {
    const p = players[i];
    return `${i + 1}. ${p ? '@' + (p.username ?? p.telegram_id) : '-'}`;
  }).join('\n');

  const footer = {
    waiting: '⏳ Esperando jugadores...',
    running: '🟢 Partida iniciada',
    expired: '⌛ Mesa expirada',
    cancelled: '⛔ Mesa cancelada',
  }[status];

  return `🤠 PokerFace - Mesa rápida\n\n🪑 Jugadores (${players.length}/${max})\n\n${rows}\n\n${footer}`;
}
