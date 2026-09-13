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

// La mesa siempre tiene 8 asientos posibles (ver max_players en Supabase).
const MAX_SEATS = 8;

// Posiciones alrededor de la mesa ovalada, en % (top/left).
// Índice 0 = abajo al centro, donde SIEMPRE se ubica "yo"; el resto
// se distribuye en sentido horario a partir de mi asiento.
const SEAT_POSITIONS = [
  { top: 95, left: 50 }, // 0 - yo
  { top: 83, left: 13 }, // 1 - abajo-izquierda
  { top: 45, left: 2 }, // 2 - izquierda
  { top: 10, left: 15 }, // 3 - arriba-izquierda
  { top: 1, left: 50 }, // 4 - arriba-centro
  { top: 10, left: 85 }, // 5 - arriba-derecha
  { top: 45, left: 98 }, // 6 - derecha
  { top: 83, left: 87 }, // 7 - abajo-derecha
];

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
          <div className="board-center">
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
          </div>

          <div className="seats">
            {players.map((p) => {
              const isMe = p.seat === me.seat_number;
              const rel = (((p.seat - me.seat_number) % MAX_SEATS) + MAX_SEATS) % MAX_SEATS;
              const pos = SEAT_POSITIONS[rel] ?? SEAT_POSITIONS[0];
              return (
                <div
                  key={p.seat}
                  className="seat-slot"
                  style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                >
                  <Seat player={p} isMe={isMe} isTurn={p.seat === game.current_seat} />
                  {isMe && hand && (
                    <div className="hole">
                      <PlayingCard code={hand.card_1} />
                      <PlayingCard code={hand.card_2} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
