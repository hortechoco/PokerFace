import type { LastResult, PlayerView } from '../types';
import { PlayingCard } from './PlayingCard';

function seatName(seat: number, players: PlayerView[]) {
  return players.find((p) => p.seat === seat)?.username ?? `Asiento ${seat}`;
}

export function WinnerBanner({ result, players }: { result: LastResult; players: PlayerView[] }) {
  const names = result.winners.map((s) => seatName(s, players)).join(' y ');

  return (
    <div className="winner-overlay">
      <div className="winner-card">
        <div className="winner-glyph">🏆</div>
        <div className="winner-text">
          <strong>{names}</strong> ganó {result.pot.toLocaleString('es')} 🪙
          {result.reason === 'fold' ? (
            <span> · los demás jugadores se retiraron</span>
          ) : (
            <span>
              {' '}
              con <strong>{result.hand_name}</strong>
            </span>
          )}
        </div>
        {result.reason === 'showdown' && result.winning_cards && (
          <div className="winner-cards">
            {result.winning_cards.map((c, i) => (
              <PlayingCard key={i} code={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
