import type { PlayerView } from '../types';

export function Seat({
  player,
  isMe,
  isTurn,
}: {
  player: PlayerView;
  isMe: boolean;
  isTurn: boolean;
}) {
  const classes = ['seat'];
  if (player.folded) classes.push('folded');
  if (isTurn) classes.push('turn');
  if (isMe) classes.push('me');

  const label = isMe ? 'Tú' : player.username ?? `Asiento ${player.seat}`;
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  const flag = player.folded ? 'RETIRADO' : player.all_in ? 'ALL-IN' : null;
  const showBet = !player.folded && (player.bet ?? 0) > 0;

  return (
    <div className={classes.join(' ')}>
      <div className="avatar">{initial}</div>
      <div className="name" title={label}>
        {label}
      </div>
      <div className="chips">{player.chips.toLocaleString('es')} 🪙</div>
      {flag && <span className="flag">{flag}</span>}
      {isTurn && <span className="badge" aria-label="Su turno" />}
      {showBet && <span className="seat-bet">{(player.bet ?? 0).toLocaleString('es')}</span>}
    </div>
  );
}
