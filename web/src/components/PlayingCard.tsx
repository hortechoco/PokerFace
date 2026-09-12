const RED_SUITS = new Set(['♥', '♦']);

export function PlayingCard({ code }: { code: string }) {
  const suit = code.slice(-1);
  const isRed = RED_SUITS.has(suit);
  return <div className={`card${isRed ? ' red' : ''}`}>{code}</div>;
}

export function CardBack() {
  return <div className="card back" aria-hidden="true" />;
}
