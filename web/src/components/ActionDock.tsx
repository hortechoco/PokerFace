import { useState } from 'react';
import type { ActionKind } from '../types';

export function ActionDock({
  visible,
  toCall,
  isBetting,
  minRaise,
  busy,
  onAction,
}: {
  visible: boolean;
  toCall: number;
  isBetting: boolean;
  minRaise: number;
  busy: boolean;
  onAction: (action: ActionKind, amount?: number) => void;
}) {
  const [amount, setAmount] = useState('');

  if (!visible) return null;

  const submitBetOrRaise = () => {
    const value = Number(amount || minRaise);
    onAction(isBetting ? 'bet' : 'raise', value);
    setAmount('');
  };

  return (
    <div className="action-dock">
      <div className="bet-row">
        <input
          type="number"
          inputMode="numeric"
          min={minRaise}
          step={10}
          placeholder={`Mín. ${minRaise}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={busy}
        />
        <button onClick={submitBetOrRaise} disabled={busy}>
          {isBetting ? 'APOSTAR' : 'SUBIR'}
        </button>
      </div>
      <div className="actions">
        <button className="fold" onClick={() => onAction('fold')} disabled={busy}>
          RETIRARSE
        </button>
        <button onClick={() => onAction('check')} disabled={busy || toCall > 0}>
          PASAR
        </button>
        <button onClick={() => onAction('call')} disabled={busy || toCall === 0}>
          {toCall > 0 ? `IGUALAR ${toCall}` : 'IGUALAR'}
        </button>
        <button className="all-in" onClick={() => onAction('all_in')} disabled={busy}>
          ALL-IN
        </button>
      </div>
    </div>
  );
}
