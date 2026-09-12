import type { StateResponse } from '../types';
import { PlayingCard, CardBack } from './PlayingCard';
import { Seat } from './Seat';

const STAGE_LABEL: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export function Table({ state }: { state: StateResponse }) {
  const { game, players, me, hand } = state;
  const stageLabel = STAGE_LABEL[game.stage] ?? game.stage;
  const isMyTurn = me.seat_number === game.current_seat;
  const toCall = Math.max(0, game.current_bet - (hand?.round_contributed ?? 0));

  return (
    <>
      <div className="topbar">
        <span className="wordmark">
          <span className="suit">♠</span> PokerFace
        </span>
        <span className="stage-pill">{stageLabel}</span>
      </div>

      <div className="table-wrap">
        <div className="felt">
          <div className="pot">
            <div className="amount">{game.pot.toLocaleString('es')} 🪙</div>
            <div className="label">
              Ciegas {game.small_blind}/{game.big_blind}
            </div>
          </div>

          <div className="board">
            {game.community_cards.map((c, i) => (
              <PlayingCard key={i} code={c} />
            ))}
            {Array.from({ length: 5 - game.community_cards.length }).map((_, i) => (
              <CardBack key={`back-${i}`} />
            ))}
          </div>

          <div className="seats">
            {players.map((p) => (
              <Seat
                key={p.seat}
                player={p}
                isMe={p.seat === me.seat_number}
                isTurn={p.seat === game.current_seat}
              />
            ))}
          </div>

          {hand && (
            <div className="hole">
              <PlayingCard code={hand.card_1} />
              <PlayingCard code={hand.card_2} />
            </div>
          )}
        </div>
      </div>

      <div className={`turn-banner${isMyTurn ? ' mine' : ''}`}>
        {isMyTurn ? (
          <>
            <strong>Tu turno</strong> — {toCall > 0 ? `a pagar ${toCall}` : 'puedes pasar'}
          </>
        ) : (
          <>Turno del asiento {game.current_seat ?? '—'}</>
        )}
      </div>
    </>
  );
}
