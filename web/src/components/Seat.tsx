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

  const flag = player.folded ? 'RETIRADO' : player.all_in ? 'ALL-IN' : null;

  return (
    <div className={classes.join(' ')}>
      <div className="who">
        <span className="name">
          {isMe ? 'Tú' : player.username ?? `Asiento ${player.seat}`}
        </span>
        <span className="chips">{player.chips.toLocaleString('es')} 🪙</span>
        {flag && <span className="flag">{flag}</span>}
      </div>
      {isTurn && <span className="badge" aria-label="Su turno" />}
    </div>
  );
}
